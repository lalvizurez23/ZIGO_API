import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../../database/entities/usuario.entity';
import { Carrito } from '../../../database/entities/carrito.entity';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Carrito)
    private readonly carritoRepository: Repository<Carrito>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, nombre, apellido, telefono, direccion } = registerDto;

    try {
      // Verificar si el email ya existe
      const existingUser = await this.usuarioRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      // Crear nuevo usuario
      const newUser = this.usuarioRepository.create({
        email,
        password: hashedPassword,
        nombre,
        apellido,
        telefono,
        direccion,
        estaActivo: true,
      });

      // Guardar en la base de datos
      const savedUser = await this.usuarioRepository.save(newUser);

      // Crear carrito automáticamente para el nuevo usuario
      const newCarrito = this.carritoRepository.create({
        idUsuario: savedUser.idUsuario,
        estaActivo: true,
      });
      await this.carritoRepository.save(newCarrito);

      this.logger.log(`Nuevo usuario registrado: ${savedUser.email} con carrito ID: ${newCarrito.idCarrito}`);

      // Generar token JWT
      const accessToken = await this.generateToken(savedUser.idUsuario, savedUser.email);

      // Retornar respuesta sin datos sensibles
      return {
        accessToken,
        user: {
          idUsuario: savedUser.idUsuario,
          email: savedUser.email,
          nombre: savedUser.nombre,
          apellido: savedUser.apellido,
          telefono: savedUser.telefono,
          direccion: savedUser.direccion,
          estaActivo: savedUser.estaActivo,
          fechaCreacion: savedUser.fechaCreacion,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error al registrar usuario: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al registrar el usuario');
    }
  }

  /**
   * Autentica un usuario y retorna el token JWT junto con el perfil
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    try {
      // Buscar usuario por email
      const user = await this.usuarioRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Verificar si el usuario está activo
      if (!user.estaActivo) {
        throw new UnauthorizedException('Usuario inactivo');
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      this.logger.log(`Usuario autenticado exitosamente: ${user.email}`);

      // Generar token JWT
      const accessToken = await this.generateToken(user.idUsuario, user.email);

      // Retornar respuesta con perfil completo y token
      return {
        accessToken,
        user: {
          idUsuario: user.idUsuario,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          telefono: user.telefono,
          direccion: user.direccion,
          estaActivo: user.estaActivo,
          fechaCreacion: user.fechaCreacion,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Error en login: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al iniciar sesión');
    }
  }

  /**
   * Valida un usuario por ID (usado por JWT Strategy)
   */
  async validateUserById(userId: number): Promise<Usuario | null> {
    try {
      const user = await this.usuarioRepository.findOne({
        where: { idUsuario: userId, estaActivo: true },
      });
      return user;
    } catch (error) {
      this.logger.error(`Error al validar usuario por ID: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Genera un nuevo token JWT para un usuario
   */
  private async generateToken(userId: number, email: string): Promise<string> {
    const jwtExpiration = this.configService.get<string>('JWT_EXPIRATION', '10m');
    
    // Generar access token con tiempo configurado
    const accessTokenPayload = { 
      sub: userId, 
      email, 
      iat: Math.floor(Date.now() / 1000)
    };
    
    return this.jwtService.sign(accessTokenPayload, { expiresIn: jwtExpiration });
  }

  /**
   * Renueva un token extendiendo su tiempo de expiración
   */
  async refreshToken(currentToken: string): Promise<string> {
    try {
      // Verificar que el token actual no esté en blacklist
      const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(currentToken);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token ha sido revocado');
      }

      // Decodificar el token actual para obtener información del usuario
      const decodedToken = this.jwtService.decode(currentToken) as any;
      
      if (!decodedToken || !decodedToken.sub) {
        throw new UnauthorizedException('Token inválido');
      }

      // Verificar que el usuario existe y está activo
      const user = await this.usuarioRepository.findOne({
        where: { idUsuario: decodedToken.sub, estaActivo: true },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no válido o inactivo');
      }

      // Agregar token actual a blacklist
      await this.tokenBlacklistService.addToBlacklist(currentToken);

      // Generar nuevo token con tiempo extendido
      const renewalExtension = this.configService.get<string>('JWT_RENEWAL_EXTENSION', '10m');
      const newTokenPayload = { 
        sub: user.idUsuario, 
        email: user.email,
        iat: Math.floor(Date.now() / 1000)
      };
      
      const newAccessToken = this.jwtService.sign(newTokenPayload, { expiresIn: renewalExtension });

      this.logger.log(`Token renovado para usuario: ${user.email}`);

      return newAccessToken;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Error al renovar token: ${error.message}`, error.stack);
      throw new UnauthorizedException('Error al renovar el token');
    }
  }

  /**
   * Revoca un token agregándolo a la blacklist (logout)
   */
  async revokeToken(token: string): Promise<void> {
    try {
      await this.tokenBlacklistService.addToBlacklist(token);
      this.logger.log('Token revocado exitosamente');
    } catch (error) {
      this.logger.error(`Error al revocar token: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al cerrar sesión');
    }
  }

  /**
   * Revoca todos los tokens de un usuario (logout de todos los dispositivos)
   * Nota: En este sistema simplificado, no podemos revocar tokens específicos de un usuario
   * sin mantener un registro. Para una implementación completa, necesitarías almacenar
   * los tokens activos por usuario en Redis.
   */
  async revokeAllUserTokens(userId: number): Promise<void> {
    try {
      // En un sistema más complejo, aquí buscarías todos los tokens activos del usuario
      // y los agregarías a la blacklist. Por ahora, solo logueamos la acción.
      this.logger.log(`Logout masivo solicitado para usuario: ${userId}`);
      this.logger.warn('Nota: Para revocar todos los tokens de un usuario, se requiere un sistema más complejo que mantenga registro de tokens activos por usuario');
    } catch (error) {
      this.logger.error(`Error al revocar todos los tokens: ${error.message}`, error.stack);
    }
  }

  /**
   * Convierte una cadena de expiración (ej: "10m", "1h", "24h") a segundos
   */
  private parseExpirationToSeconds(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // 1 hora por defecto
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  }
}


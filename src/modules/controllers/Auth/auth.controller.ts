import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../../controllers/Auth/auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { Usuario } from '../../../database/entities/usuario.entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Registra un nuevo usuario
   */
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Solicitud de registro recibida para: ${registerDto.email}`);
    return await this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Autentica un usuario y retorna el token JWT junto con su perfil
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log(`Solicitud de login recibida para: ${loginDto.email}`);
    return await this.authService.login(loginDto);
  }

  /**
   * POST /auth/refresh
   * Renueva un token extendiendo su tiempo de expiración
   */
  // Endpoint de refresh removido - ahora es automático en todos los endpoints protegidos
  // El refresh se maneja automáticamente por el TokenRefreshInterceptor

  /**
   * POST /auth/logout
   * Revoca un token agregándolo a la blacklist (logout)
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
    this.logger.log('Solicitud de logout recibida');
    await this.authService.revokeToken(refreshTokenDto.refreshToken);
    return { message: 'Logout exitoso' };
  }

  /**
   * POST /auth/logout-all
   * Revoca todos los tokens de un usuario (logout de todos los dispositivos)
   */
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logoutAll(@GetUser() user: Usuario): Promise<{ message: string }> {
    this.logger.log(`Solicitud de logout de todos los dispositivos para: ${user.email}`);
    await this.authService.revokeAllUserTokens(user.idUsuario);
    return { message: 'Logout de todos los dispositivos exitoso' };
  }
}


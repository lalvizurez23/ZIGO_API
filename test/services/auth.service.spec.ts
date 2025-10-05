import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../src/modules/controllers/Auth/auth.service';
import { Usuario } from '../../src/database/entities/usuario.entity';
import { Carrito } from '../../src/database/entities/carrito.entity';
import { TokenBlacklistService } from '../../src/modules/controllers/Auth/services/token-blacklist.service';
import { RegisterDto } from '../../src/modules/controllers/Auth/dto/register.dto';
import { LoginDto } from '../../src/modules/controllers/Auth/dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usuarioRepository: Repository<Usuario>;
  let carritoRepository: Repository<Carrito>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let tokenBlacklistService: TokenBlacklistService;

  const mockUsuarioRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCarritoRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRATION: '1d',
      };
      return config[key];
    }),
  };

  const mockTokenBlacklistService = {
    addToBlacklist: jest.fn(),
    isBlacklisted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
        {
          provide: getRepositoryToken(Carrito),
          useValue: mockCarritoRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuarioRepository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    carritoRepository = module.get<Repository<Carrito>>(getRepositoryToken(Carrito));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        nombre: 'Test',
        apellido: 'User',
        telefono: '12345678',
        direccion: 'Test Address',
      };

      const hashedPassword = 'hashedPassword123';
      const savedUser = {
        idUsuario: 1,
        email: registerDto.email,
        nombre: registerDto.nombre,
        apellido: registerDto.apellido,
        password: hashedPassword,
        telefono: registerDto.telefono,
        direccion: registerDto.direccion,
        estaActivo: true,
      };

      const savedCarrito = {
        idCarrito: 1,
        idUsuario: savedUser.idUsuario,
        estaActivo: true,
      };

      mockUsuarioRepository.findOne.mockResolvedValue(null);
      mockUsuarioRepository.create.mockReturnValue(savedUser);
      mockUsuarioRepository.save.mockResolvedValue(savedUser);
      mockCarritoRepository.create.mockReturnValue(savedCarrito);
      mockCarritoRepository.save.mockResolvedValue(savedCarrito);
      mockJwtService.sign.mockReturnValue('jwt-token');

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));

      const result = await service.register(registerDto);

      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUsuarioRepository.create).toHaveBeenCalled();
      expect(mockUsuarioRepository.save).toHaveBeenCalled();
      expect(mockCarritoRepository.create).toHaveBeenCalledWith({
        idUsuario: savedUser.idUsuario,
        estaActivo: true,
      });
      expect(mockCarritoRepository.save).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', 'jwt-token');
      expect(result.user).toHaveProperty('email', registerDto.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'password123',
        nombre: 'Test',
        apellido: 'User',
        telefono: '12345678',
        direccion: 'Test Address',
      };

      mockUsuarioRepository.findOne.mockResolvedValue({ email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUsuarioRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('debe iniciar sesión exitosamente con credenciales válidas', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        idUsuario: 1,
        email: loginDto.email,
        password: 'hashedPassword123',
        nombre: 'Test',
        apellido: 'User',
        telefono: '12345678',
        direccion: 'Test Address',
        estaActivo: true,
      };

      mockUsuarioRepository.findOne.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('jwt-token');

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.login(loginDto);

      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', 'jwt-token');
      expect(result.user).toHaveProperty('email', loginDto.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const user = {
        idUsuario: 1,
        email: loginDto.email,
        password: 'hashedPassword123',
        nombre: 'Test',
        apellido: 'User',
        telefono: '12345678',
        direccion: 'Test Address',
        estaActivo: true,
      };

      mockUsuarioRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
    });

    it('debe lanzar UnauthorizedException si el usuario está inactivo', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        idUsuario: 1,
        email: loginDto.email,
        password: 'hashedPassword123',
        nombre: 'Test',
        apellido: 'User',
        telefono: '12345678',
        direccion: 'Test Address',
        estaActivo: false,
      };

      mockUsuarioRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});

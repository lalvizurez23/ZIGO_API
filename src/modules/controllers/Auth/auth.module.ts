import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Usuario } from '../../../database/entities/usuario.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRATION');

        if (!secret) {
          throw new Error(
            'JWT_SECRET no está configurado en las variables de entorno. ' +
            'Por favor, configura JWT_SECRET en tu archivo .env'
          );
        }

        if (!expiresIn) {
          throw new Error(
            'JWT_EXPIRATION no está configurado en las variables de entorno. ' +
            'Por favor, configura JWT_EXPIRATION en tu archivo .env'
          );
        }

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenBlacklistService, JwtAuthGuard],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule, TokenBlacklistService, JwtAuthGuard],
})
export class AuthModule {}


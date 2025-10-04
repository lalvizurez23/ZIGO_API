import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenBlacklistService } from '../services/token-blacklist.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly tokenBlacklistService: TokenBlacklistService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero ejecutar la validación básica del JWT
    const isValid = await super.canActivate(context);
    
    if (!isValid) {
      return false;
    }

    // Obtener el request para extraer el token
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.substring(7);

    // Verificar si el token está en la blacklist
    const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token ha sido revocado');
    }

    return true;
  }
}

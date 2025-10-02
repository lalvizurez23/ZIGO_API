import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Usuario } from '../../../../database/entities/usuario.entity';

/**
 * Decorador personalizado para obtener el usuario autenticado desde el request
 * Uso: @GetUser() user: Usuario
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): Usuario => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);


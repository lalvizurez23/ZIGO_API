import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { EstadoPedido } from './create-pedido.dto';

export class UpdatePedidoDto {
  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  metodoPago?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionEnvio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notas?: string;
}

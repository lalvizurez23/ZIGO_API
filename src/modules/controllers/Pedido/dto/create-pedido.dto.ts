import { IsNumber, IsPositive, IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';

export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  PROCESANDO = 'procesando',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

export class CreatePedidoDto {
  @IsNumber()
  @IsPositive()
  total: number;

  @IsOptional()
  @IsEnum(EstadoPedido)
  estado?: EstadoPedido = EstadoPedido.PENDIENTE;

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

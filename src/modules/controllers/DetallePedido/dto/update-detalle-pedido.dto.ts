import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class UpdateDetallePedidoDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  cantidad?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  precioUnitario?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  subtotal?: number;
}

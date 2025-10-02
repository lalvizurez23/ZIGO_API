import { IsNumber, IsPositive, Min } from 'class-validator';

export class CreateDetallePedidoDto {
  @IsNumber()
  @IsPositive()
  idPedido: number;

  @IsNumber()
  @IsPositive()
  idProducto: number;

  @IsNumber()
  @Min(1)
  cantidad: number;

  @IsNumber()
  @IsPositive()
  precioUnitario: number;

  @IsNumber()
  @IsPositive()
  subtotal: number;
}

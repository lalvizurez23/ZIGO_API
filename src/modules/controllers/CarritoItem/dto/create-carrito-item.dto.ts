import { IsNumber, IsPositive, Min } from 'class-validator';

export class CreateCarritoItemDto {
  @IsNumber()
  @IsPositive()
  idCarrito: number;

  @IsNumber()
  @IsPositive()
  idProducto: number;

  @IsNumber()
  @Min(1)
  cantidad: number = 1;
}

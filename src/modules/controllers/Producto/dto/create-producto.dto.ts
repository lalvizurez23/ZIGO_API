import { IsString, IsNotEmpty, IsOptional, IsUrl, MaxLength, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateProductoDto {
  @IsNumber()
  @IsPositive()
  idCategoria: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  descripcion?: string;

  @IsNumber()
  @IsPositive()
  precio: number;

  @IsNumber()
  @Min(0)
  stock: number = 0;

  @IsString()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imagenUrl?: string;
}

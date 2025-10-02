import { IsString, IsOptional, IsUrl, MaxLength, IsNumber, IsPositive, Min } from 'class-validator';

export class UpdateProductoDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  idCategoria?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  precio?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(500)
  imagenUrl?: string;
}

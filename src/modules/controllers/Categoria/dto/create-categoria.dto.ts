import { IsString, IsNotEmpty, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imagenUrl?: string;
}

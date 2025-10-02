import { IsOptional, IsBoolean } from 'class-validator';

export class CreateCarritoDto {
  @IsOptional()
  @IsBoolean()
  estaActivo?: boolean = true;
}

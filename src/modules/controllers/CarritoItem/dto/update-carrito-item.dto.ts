import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateCarritoItemDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  cantidad?: number;
}

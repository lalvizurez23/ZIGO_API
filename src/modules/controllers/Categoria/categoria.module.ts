import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaController } from './categoria.controller';
import { CategoriaService } from './categoria.service';
import { Categoria } from '../../../database/entities/categoria.entity';
import { AuthModule } from '../Auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria]),
    AuthModule
  ],
  controllers: [CategoriaController],
  providers: [CategoriaService],
  exports: [CategoriaService],
})
export class CategoriaModule {}

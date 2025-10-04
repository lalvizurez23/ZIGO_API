import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';
import { Producto } from '../../../database/entities/producto.entity';
import { Categoria } from '../../../database/entities/categoria.entity';
import { AuthModule } from '../Auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Categoria]),
    AuthModule
  ],
  controllers: [ProductoController],
  providers: [ProductoService],
  exports: [ProductoService],
})
export class ProductoModule {}
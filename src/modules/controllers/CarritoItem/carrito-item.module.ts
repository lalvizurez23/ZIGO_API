import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoItemController } from './carrito-item.controller';
import { CarritoItemService } from './carrito-item.service';
import { CarritoItem } from '../../../database/entities/carrito-item.entity';
import { Carrito } from '../../../database/entities/carrito.entity';
import { Producto } from '../../../database/entities/producto.entity';
import { AuthModule } from '../Auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarritoItem, Carrito, Producto]),
    AuthModule
  ],
  controllers: [CarritoItemController],
  providers: [CarritoItemService],
  exports: [CarritoItemService],
})
export class CarritoItemModule {}
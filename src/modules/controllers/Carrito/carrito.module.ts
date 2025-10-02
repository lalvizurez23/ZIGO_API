import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoController } from './carrito.controller';
import { CarritoService } from './carrito.service';
import { Carrito } from '../../../database/entities/carrito.entity';
import { Usuario } from '../../../database/entities/usuario.entity';
import { AuthModule } from '../Auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrito, Usuario]),
    AuthModule
  ],
  controllers: [CarritoController],
  providers: [CarritoService],
  exports: [CarritoService],
})
export class CarritoModule {}
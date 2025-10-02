import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { Pedido } from '../../../database/entities/pedido.entity';
import { Usuario } from '../../../database/entities/usuario.entity';
import { Carrito } from '../../../database/entities/carrito.entity';
import { CarritoItem } from '../../../database/entities/carrito-item.entity';
import { DetallePedido } from '../../../database/entities/detalle-pedido.entity';
import { AuthModule } from '../Auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, Usuario, Carrito, CarritoItem, DetallePedido]),
    AuthModule
  ],
  controllers: [PedidoController],
  providers: [PedidoService],
  exports: [PedidoService],
})
export class PedidoModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallePedidoController } from './detalle-pedido.controller';
import { DetallePedidoService } from './detalle-pedido.service';
import { DetallePedido } from '../../../database/entities/detalle-pedido.entity';
import { Pedido } from '../../../database/entities/pedido.entity';
import { Producto } from '../../../database/entities/producto.entity';
import { AuthModule } from '../Auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetallePedido, Pedido, Producto]),
    AuthModule
  ],
  controllers: [DetallePedidoController],
  providers: [DetallePedidoService],
  exports: [DetallePedidoService],
})
export class DetallePedidoModule {}
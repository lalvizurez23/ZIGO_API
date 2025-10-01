import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Pedido } from './pedido.entity';
import type { Producto } from './producto.entity';

@Entity('detalle_pedido')
@Index('IX_detalle_pedido', ['idPedido'])
export class DetallePedido {
  @PrimaryGeneratedColumn({ name: 'id_detalle_pedido' })
  idDetallePedido: number;

  @Column({ name: 'id_pedido', nullable: false })
  idPedido: number;

  @Column({ name: 'id_producto', nullable: false })
  idProducto: number;

  @Column({
    name: 'cantidad',
    type: 'int',
    nullable: false,
  })
  cantidad: number;

  @Column({
    name: 'precio_unitario',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
  })
  precioUnitario: number;

  @Column({
    name: 'subtotal',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
  })
  subtotal: number;

  // Relaciones
  @ManyToOne('Pedido', 'detalles', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_pedido' })
  pedido: Pedido;

  @ManyToOne('Producto', 'detallesPedido', {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;
}

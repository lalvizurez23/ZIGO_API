import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Producto } from './producto.entity';

@Entity('detalle_pedido')
@Index('IX_detalle_pedido', ['idPedido'])
@Index('IX_detalle_producto', ['idProducto'])
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
    name: 'descuento',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  descuento: number;

  @Column({
    name: 'subtotal',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
  })
  subtotal: number;

  @Column({
    name: 'nombre_producto',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  nombreProducto: string;

  @Column({
    name: 'codigo_sku',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  codigoSku: string;

  // Relaciones
  @ManyToOne(() => Pedido, (pedido) => pedido.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_pedido' })
  pedido: Pedido;

  @ManyToOne(() => Producto, (producto) => producto.detallesPedido, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Carrito } from './carrito.entity';
import { Producto } from './producto.entity';

@Entity('carrito_item')
@Index('IX_carrito_item_carrito', ['idCarrito'])
@Index('IX_carrito_item_producto', ['idProducto'])
@Index('UQ_carrito_item_producto', ['idCarrito', 'idProducto'], { unique: true })
export class CarritoItem {
  @PrimaryGeneratedColumn({ name: 'id_carrito_item' })
  idCarritoItem: number;

  @Column({ name: 'id_carrito', nullable: false })
  idCarrito: number;

  @Column({ name: 'id_producto', nullable: false })
  idProducto: number;

  @Column({
    name: 'cantidad',
    type: 'int',
    default: 1,
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

  @CreateDateColumn({
    name: 'fecha_agregado',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaAgregado: Date;

  // Relaciones
  @ManyToOne(() => Carrito, (carrito) => carrito.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_carrito' })
  carrito: Carrito;

  @ManyToOne(() => Producto, (producto) => producto.carritoItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;
}


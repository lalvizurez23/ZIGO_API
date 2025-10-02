import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Carrito } from './carrito.entity';
import type { Producto } from './producto.entity';

@Entity('carrito_item')
@Index('IX_carrito_item_carrito', ['idCarrito'])
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

  @CreateDateColumn({
    name: 'fecha_agregado',
    type: 'datetime',
  })
  fechaAgregado: Date;

  // Relaciones
  @ManyToOne('Carrito', 'items', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_carrito' })
  carrito: Carrito;

  @ManyToOne('Producto', 'carritoItems', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;
}

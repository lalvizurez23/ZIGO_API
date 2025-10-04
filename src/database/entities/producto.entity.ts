import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Categoria } from './categoria.entity';
import type { DetallePedido } from './detalle-pedido.entity';
import type { CarritoItem } from './carrito-item.entity';

@Entity('producto')
@Index('IX_productos_nombre', ['nombre'])
@Index('IX_productos_categoria', ['idCategoria'])
@Index('IX_productos_activo', ['estaActivo'])
export class Producto {
  @PrimaryGeneratedColumn({ name: 'id_producto' })
  idProducto: number;

  @Column({ name: 'id_categoria', nullable: false })
  idCategoria: number;

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  nombre: string;

  @Column({
    name: 'descripcion',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  descripcion: string;

  @Column({
    name: 'precio',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
  })
  precio: number;

  @Column({
    name: 'stock',
    type: 'int',
    default: 0,
  })
  stock: number;

  @Column({
    name: 'imagen_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  imagenUrl: string;

  @Column({
    name: 'esta_activo',
    type: 'boolean',
    default: true,
  })
  estaActivo: boolean;

  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'datetime',
  })
  fechaCreacion: Date;

  @UpdateDateColumn({
    name: 'fecha_actualizacion',
    type: 'datetime',
  })
  fechaActualizacion: Date;

  // Relaciones
  @ManyToOne('Categoria', 'productos', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;

  @OneToMany('DetallePedido', 'producto')
  detallesPedido: DetallePedido[];

  @OneToMany('CarritoItem', 'producto')
  carritoItems: CarritoItem[];
}

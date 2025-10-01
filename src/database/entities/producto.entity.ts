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
import { Categoria } from './categoria.entity';
import { Proveedor } from './proveedor.entity';
import { ProductoImagen } from './producto-imagen.entity';
import { Inventario } from './inventario.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { CarritoItem } from './carrito-item.entity';

@Entity('producto')
@Index('IX_productos_sku', ['codigoProducto'])
@Index('IX_productos_nombre', ['nombreProducto'])
@Index('IX_productos_categoria', ['idCategoria'])
@Index('IX_productos_proveedor', ['idProveedor'])
@Index('IX_productos_activo', ['estaActivo'])
@Index('IX_productos_precio', ['precioVenta'])
export class Producto {
  @PrimaryGeneratedColumn({ name: 'id_producto' })
  idProducto: number;

  @Column({ name: 'id_categoria', nullable: false })
  idCategoria: number;

  @Column({ name: 'id_proveedor', nullable: true })
  idProveedor: number;

  @Column({
    name: 'codigo_producto',
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  codigoProducto: string;

  @Column({
    name: 'nombre_producto',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  nombreProducto: string;

  @Column({
    name: 'descripcion',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  descripcion: string;

  @Column({
    name: 'descripcion_corta',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  descripcionCorta: string;

  @Column({
    name: 'precio_compra',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
  })
  precioCompra: number;

  @Column({
    name: 'precio_venta',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
  })
  precioVenta: number;

  @Column({
    name: 'precio_descuento',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  precioDescuento: number;

  @Column({
    name: 'porcentaje_descuento',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  porcentajeDescuento: number;

  @Column({
    name: 'imagen_principal',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  imagenPrincipal: string;

  @Column({
    name: 'esta_activo',
    type: 'boolean',
    default: true,
  })
  estaActivo: boolean;

  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCreacion: Date;

  @UpdateDateColumn({
    name: 'fecha_actualizacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  fechaActualizacion: Date;

  // Relaciones
  @ManyToOne(() => Categoria, (categoria) => categoria.productos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.productos, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'id_proveedor' })
  proveedor: Proveedor;

  @OneToMany(() => ProductoImagen, (imagen) => imagen.producto)
  imagenes: ProductoImagen[];

  @OneToMany(() => Inventario, (inventario) => inventario.producto)
  inventarios: Inventario[];

  @OneToMany(() => DetallePedido, (detalle) => detalle.producto)
  detallesPedido: DetallePedido[];

  @OneToMany(() => CarritoItem, (item) => item.producto)
  carritoItems: CarritoItem[];
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Producto } from './producto.entity';
import { Bodega } from './bodega.entity';
import { MovimientoInventario } from './movimiento-inventario.entity';

@Entity('inventario')
@Index('IX_inventario_producto', ['idProducto'])
@Index('IX_inventario_bodega', ['idBodega'])
@Index('IX_inventario_cantidad', ['cantidadDisponible'])
@Index('UQ_inventario_producto_bodega', ['idProducto', 'idBodega'], { unique: true })
export class Inventario {
  @PrimaryGeneratedColumn({ name: 'id_inventario' })
  idInventario: number;

  @Column({ name: 'id_producto', nullable: false })
  idProducto: number;

  @Column({ name: 'id_bodega', nullable: false })
  idBodega: number;

  @Column({
    name: 'cantidad_disponible',
    type: 'int',
    default: 0,
  })
  cantidadDisponible: number;

  @Column({
    name: 'cantidad_minima',
    type: 'int',
    default: 10,
  })
  cantidadMinima: number;

  @Column({
    name: 'cantidad_maxima',
    type: 'int',
    default: 1000,
  })
  cantidadMaxima: number;

  @Column({
    name: 'ubicacion_fisica',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  ubicacionFisica: string;

  @Column({
    name: 'fecha_ultima_entrada',
    type: 'timestamp',
    nullable: true,
  })
  fechaUltimaEntrada: Date;

  @Column({
    name: 'fecha_ultima_salida',
    type: 'timestamp',
    nullable: true,
  })
  fechaUltimaSalida: Date;

  @UpdateDateColumn({
    name: 'fecha_actualizacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  fechaActualizacion: Date;

  // Relaciones
  @ManyToOne(() => Producto, (producto) => producto.inventarios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;

  @ManyToOne(() => Bodega, (bodega) => bodega.inventarios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_bodega' })
  bodega: Bodega;

  @OneToMany(() => MovimientoInventario, (movimiento) => movimiento.inventario)
  movimientos: MovimientoInventario[];
}


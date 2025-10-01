import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Inventario } from './inventario.entity';
import { MovimientoInventario } from './movimiento-inventario.entity';

@Entity('bodega')
@Index('IX_bodegas_activo', ['estaActivo'])
export class Bodega {
  @PrimaryGeneratedColumn({ name: 'id_bodega' })
  idBodega: number;

  @Column({
    name: 'codigo',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  codigo: string;

  @Column({
    name: 'descripcion',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  descripcion: string;

  @Column({
    name: 'direccion',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  direccion: string;

  @Column({
    name: 'departamento',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  departamento: string;

  @Column({
    name: 'municipio',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  municipio: string;

  @Column({
    name: 'responsable',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  responsable: string;

  @Column({
    name: 'telefono',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  telefono: string;

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
  @OneToMany(() => Inventario, (inventario) => inventario.bodega)
  inventarios: Inventario[];

  @OneToMany(() => MovimientoInventario, (movimiento) => movimiento.bodegaOrigen)
  movimientosOrigen: MovimientoInventario[];

  @OneToMany(() => MovimientoInventario, (movimiento) => movimiento.bodegaDestino)
  movimientosDestino: MovimientoInventario[];
}


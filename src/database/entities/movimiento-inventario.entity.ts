import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Inventario } from './inventario.entity';
import { Usuario } from './usuario.entity';
import { Bodega } from './bodega.entity';

@Entity('movimiento_inventario')
@Index('IX_movimiento_inventario', ['idInventario'])
@Index('IX_movimiento_fecha', ['fechaMovimiento'])
@Index('IX_movimiento_tipo', ['tipoMovimiento'])
@Index('IX_movimiento_usuario', ['idUsuario'])
export class MovimientoInventario {
  @PrimaryGeneratedColumn({ name: 'id_movimiento' })
  idMovimiento: number;

  @Column({ name: 'id_inventario', nullable: false })
  idInventario: number;

  @Column({ name: 'id_usuario', nullable: false })
  idUsuario: number;

  @Column({
    name: 'tipo_movimiento',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  tipoMovimiento: string; // 'ENTRADA', 'SALIDA'

  @Column({
    name: 'cantidad',
    type: 'int',
    nullable: false,
  })
  cantidad: number;

  @Column({
    name: 'cantidad_anterior',
    type: 'int',
    nullable: false,
  })
  cantidadAnterior: number;

  @Column({
    name: 'cantidad_nueva',
    type: 'int',
    nullable: false,
  })
  cantidadNueva: number;

  @Column({
    name: 'id_bodega_origen',
    type: 'int',
    nullable: true,
  })
  idBodegaOrigen: number;

  @Column({
    name: 'id_bodega_destino',
    type: 'int',
    nullable: true,
  })
  idBodegaDestino: number;

  @Column({
    name: 'motivo',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  motivo: string;

  @Column({
    name: 'numero_documento',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  numeroDocumento: string;

  @CreateDateColumn({
    name: 'fecha_movimiento',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaMovimiento: Date;

  // Relaciones
  @ManyToOne(() => Inventario, (inventario) => inventario.movimientos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_inventario' })
  inventario: Inventario;

  @ManyToOne(() => Usuario, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Bodega, (bodega) => bodega.movimientosOrigen, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'id_bodega_origen' })
  bodegaOrigen: Bodega;

  @ManyToOne(() => Bodega, (bodega) => bodega.movimientosDestino, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'id_bodega_destino' })
  bodegaDestino: Bodega;
}


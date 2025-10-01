import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { EstadoPedido } from './estado-pedido.entity';
import { Usuario } from './usuario.entity';

@Entity('historial_estado_pedido')
@Index('IX_historial_pedido', ['idPedido'])
@Index('IX_historial_fecha', ['fechaCambio'])
export class HistorialEstadoPedido {
  @PrimaryGeneratedColumn({ name: 'id_historial' })
  idHistorial: number;

  @Column({ name: 'id_pedido', nullable: false })
  idPedido: number;

  @Column({ name: 'id_estado_anterior', nullable: true })
  idEstadoAnterior: number;

  @Column({ name: 'id_estado_nuevo', nullable: false })
  idEstadoNuevo: number;

  @Column({ name: 'id_usuario', nullable: true })
  idUsuario: number;

  @Column({
    name: 'comentario',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  comentario: string;

  @CreateDateColumn({
    name: 'fecha_cambio',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCambio: Date;

  // Relaciones
  @ManyToOne(() => Pedido, (pedido) => pedido.historialEstados, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_pedido' })
  pedido: Pedido;

  @ManyToOne(() => EstadoPedido, (estado) => estado.historialesComoAnterior, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'id_estado_anterior' })
  estadoAnterior: EstadoPedido;

  @ManyToOne(() => EstadoPedido, (estado) => estado.historialesComoNuevo, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'id_estado_nuevo' })
  estadoNuevo: EstadoPedido;

  @ManyToOne(() => Usuario, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}


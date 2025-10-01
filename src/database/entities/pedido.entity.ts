import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { DetallePedido } from './detalle-pedido.entity';

export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  PROCESANDO = 'procesando',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

@Entity('pedido')
@Index('IX_pedidos_usuario', ['idUsuario'])
@Index('IX_pedidos_fecha', ['fechaPedido'])
export class Pedido {
  @PrimaryGeneratedColumn({ name: 'id_pedido' })
  idPedido: number;

  @Column({ name: 'id_usuario', nullable: false })
  idUsuario: number;

  @Column({
    name: 'numero_pedido',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  numeroPedido: string;

  @Column({
    name: 'total',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
  })
  total: number;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoPedido,
    default: EstadoPedido.PENDIENTE,
  })
  estado: EstadoPedido;

  @Column({
    name: 'metodo_pago',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  metodoPago: string;

  @Column({
    name: 'direccion_envio',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  direccionEnvio: string;

  @Column({
    name: 'notas',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  notas: string;

  @CreateDateColumn({
    name: 'fecha_pedido',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaPedido: Date;

  // Relaciones
  @ManyToOne(() => Usuario, (usuario) => usuario.pedidos, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, {
    cascade: true,
  })
  detalles: DetallePedido[];
}

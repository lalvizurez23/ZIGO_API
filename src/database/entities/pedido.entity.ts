import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Direccion } from './direccion.entity';
import { EstadoPedido } from './estado-pedido.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { HistorialEstadoPedido } from './historial-estado-pedido.entity';
import { Factura } from './factura.entity';

@Entity('pedido')
@Index('IX_pedidos_numero', ['numeroPedido'])
@Index('IX_pedidos_usuario', ['idUsuario'])
@Index('IX_pedidos_estado', ['idEstadoPedido'])
@Index('IX_pedidos_fecha', ['fechaPedido'])
export class Pedido {
  @PrimaryGeneratedColumn({ name: 'id_pedido' })
  idPedido: number;

  @Column({
    name: 'numero_pedido',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  numeroPedido: string;

  @Column({ name: 'id_usuario', nullable: false })
  idUsuario: number;

  @Column({ name: 'id_direccion_envio', nullable: true })
  idDireccionEnvio: number;

  @Column({ name: 'id_estado_pedido', nullable: false })
  idEstadoPedido: number;

  @Column({
    name: 'subtotal',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  subtotal: number;

  @Column({
    name: 'descuento',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  descuento: number;

  @Column({
    name: 'impuestos',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  impuestos: number;

  @Column({
    name: 'costo_envio',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  costoEnvio: number;

  @Column({
    name: 'total',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
  })
  total: number;

  @Column({
    name: 'metodo_pago',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  metodoPago: string;

  @Column({
    name: 'notas_cliente',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  notasCliente: string;

  @Column({
    name: 'notas_internas',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  notasInternas: string;

  @CreateDateColumn({
    name: 'fecha_pedido',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaPedido: Date;

  @Column({
    name: 'fecha_estimada_entrega',
    type: 'timestamp',
    nullable: true,
  })
  fechaEstimadaEntrega: Date;

  @Column({
    name: 'fecha_entrega_real',
    type: 'timestamp',
    nullable: true,
  })
  fechaEntregaReal: Date;

  @Column({
    name: 'fecha_cancelacion',
    type: 'timestamp',
    nullable: true,
  })
  fechaCancelacion: Date;

  @Column({
    name: 'motivo_cancelacion',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  motivoCancelacion: string;

  // Relaciones
  @ManyToOne(() => Usuario, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Direccion, (direccion) => direccion.pedidos, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'id_direccion_envio' })
  direccionEnvio: Direccion;

  @ManyToOne(() => EstadoPedido, (estado) => estado.pedidos, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'id_estado_pedido' })
  estadoPedido: EstadoPedido;

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido)
  detalles: DetallePedido[];

  @OneToMany(() => HistorialEstadoPedido, (historial) => historial.pedido)
  historialEstados: HistorialEstadoPedido[];

  @OneToOne(() => Factura, (factura) => factura.pedido)
  factura: Factura;
}


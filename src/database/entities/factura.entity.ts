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
import { Pedido } from './pedido.entity';
import { Usuario } from './usuario.entity';
import { MetodoPago } from './metodo-pago.entity';
import { DetalleFactura } from './detalle-factura.entity';

@Entity('factura')
@Index('IX_facturas_numero', ['numeroFactura'])
@Index('IX_facturas_pedido', ['idPedido'])
@Index('IX_facturas_usuario', ['idUsuario'])
@Index('IX_facturas_estado', ['estado'])
@Index('IX_facturas_fecha', ['fechaEmision'])
export class Factura {
  @PrimaryGeneratedColumn({ name: 'id_factura' })
  idFactura: number;

  @Column({
    name: 'numero_factura',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  numeroFactura: string;

  @Column({ name: 'id_pedido', unique: true, nullable: false })
  idPedido: number;

  @Column({ name: 'id_usuario', nullable: false })
  idUsuario: number;

  @CreateDateColumn({
    name: 'fecha_emision',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaEmision: Date;

  @Column({
    name: 'fecha_vencimiento',
    type: 'timestamp',
    nullable: true,
  })
  fechaVencimiento: Date;

  @Column({
    name: 'subtotal',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
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
    name: 'total',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
  })
  total: number;

  @Column({
    name: 'estado',
    type: 'varchar',
    length: 50,
    default: 'pagada',
  })
  estado: string; // 'pendiente', 'pagada', 'anulada'

  @Column({ name: 'id_metodo_pago', nullable: false })
  idMetodoPago: number;

  @Column({
    name: 'fecha_pago',
    type: 'timestamp',
    nullable: true,
  })
  fechaPago: Date;

  @Column({
    name: 'fecha_anulacion',
    type: 'timestamp',
    nullable: true,
  })
  fechaAnulacion: Date;

  @Column({
    name: 'motivo_anulacion',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  motivoAnulacion: string;

  // Relaciones
  @OneToOne(() => Pedido, (pedido) => pedido.factura, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_pedido' })
  pedido: Pedido;

  @ManyToOne(() => Usuario, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => MetodoPago, (metodo) => metodo.facturas, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'id_metodo_pago' })
  metodoPago: MetodoPago;

  @OneToMany(() => DetalleFactura, (detalle) => detalle.factura)
  detalles: DetalleFactura[];
}


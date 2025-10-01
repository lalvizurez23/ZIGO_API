import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Factura } from './factura.entity';

@Entity('detalle_factura')
@Index('IX_detalle_factura', ['idFactura'])
export class DetalleFactura {
  @PrimaryGeneratedColumn({ name: 'id_detalle_factura' })
  idDetalleFactura: number;

  @Column({ name: 'id_factura', nullable: false })
  idFactura: number;

  @Column({
    name: 'descripcion',
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  descripcion: string;

  @Column({
    name: 'cantidad',
    type: 'int',
    nullable: false,
  })
  cantidad: number;

  @Column({
    name: 'precio_unitario',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
  })
  precioUnitario: number;

  @Column({
    name: 'descuento',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  descuento: number;

  @Column({
    name: 'iva',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  iva: number;

  @Column({
    name: 'subtotal',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: false,
  })
  subtotal: number;

  // Relaciones
  @ManyToOne(() => Factura, (factura) => factura.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_factura' })
  factura: Factura;
}


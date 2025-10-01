import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Factura } from './factura.entity';

@Entity('metodo_pago')
@Index('IX_metodo_pago_activo', ['estaActivo'])
export class MetodoPago {
  @PrimaryGeneratedColumn({ name: 'id_metodo_pago' })
  idMetodoPago: number;

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  nombre: string;

  @Column({
    name: 'descripcion',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  descripcion: string;

  @Column({
    name: 'tipo',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  tipo: string; // 'tarjeta', 'transferencia', 'efectivo', 'otro'

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

  // Relaciones
  @OneToMany(() => Factura, (factura) => factura.metodoPago)
  facturas: Factura[];
}


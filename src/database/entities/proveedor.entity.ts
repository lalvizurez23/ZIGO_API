import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Producto } from './producto.entity';

@Entity('proveedor')
@Index('IX_proveedores_nombre', ['nombreEmpresa'])
@Index('IX_proveedores_activo', ['estaActivo'])
@Index('IX_proveedores_email', ['email'])
export class Proveedor {
  @PrimaryGeneratedColumn({ name: 'id_proveedor' })
  idProveedor: number;

  @Column({
    name: 'nombre_empresa',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  nombreEmpresa: string;

  @Column({
    name: 'nombre_contacto',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  nombreContacto: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'telefono',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  telefono: string;

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
    name: 'nit',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  nit: string;

  @Column({
    name: 'esta_activo',
    type: 'boolean',
    default: true,
  })
  estaActivo: boolean;

  @Column({
    name: 'notas',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  notas: string;

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
  @OneToMany(() => Producto, (producto) => producto.proveedor)
  productos: Producto[];
}


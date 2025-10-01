import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Pedido } from './pedido.entity';

@Entity('direccion')
@Index('IX_direcciones_usuario', ['idUsuario'])
@Index('IX_direcciones_principal', ['esPrincipal'])
export class Direccion {
  @PrimaryGeneratedColumn({ name: 'id_direccion' })
  idDireccion: number;

  @Column({ name: 'id_usuario', nullable: false })
  idUsuario: number;

  @Column({
    name: 'nombre_destinatario',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  nombreDestinatario: string;

  @Column({
    name: 'telefono',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  telefono: string;

  @Column({
    name: 'direccion_linea1',
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  direccionLinea1: string;

  @Column({
    name: 'direccion_linea2',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  direccionLinea2: string;

  @Column({
    name: 'departamento',
    type: 'varchar',
    length: 100,
    nullable: false,
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
    name: 'pais',
    type: 'varchar',
    length: 100,
    nullable: false,
    default: 'Guatemala',
  })
  pais: string;

  @Column({
    name: 'es_principal',
    type: 'boolean',
    default: false,
  })
  esPrincipal: boolean;

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
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @OneToMany(() => Pedido, (pedido) => pedido.direccionEnvio)
  pedidos: Pedido[];
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import type { Carrito } from './carrito.entity';
import type { Pedido } from './pedido.entity';

@Entity('usuario')
@Index('IX_usuarios_email', ['email'])
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  idUsuario: number;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password: string;

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  nombre: string;

  @Column({
    name: 'apellido',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  apellido: string;

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
    name: 'esta_activo',
    type: 'boolean',
    default: true,
  })
  estaActivo: boolean;

  fechaAgregado: Date;
  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'datetime',
  })
  fechaCreacion: Date;

  @UpdateDateColumn({
    name: 'fecha_actualizacion',
    type: 'datetime',
  })
  fechaActualizacion: Date;

  // Relaciones
  @OneToMany('Carrito', 'usuario')
  carritos: Carrito[];

  @OneToMany('Pedido', 'usuario')
  pedidos: Pedido[];
}

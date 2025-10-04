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
import type { Usuario } from './usuario.entity';
import type { CarritoItem } from './carrito-item.entity';

@Entity('carrito')
@Index('IX_carrito_usuario', ['idUsuario'])
export class Carrito {
  @PrimaryGeneratedColumn({ name: 'id_carrito' })
  idCarrito: number;

  @Column({ name: 'id_usuario', nullable: false })
  idUsuario: number;

  @Column({
    name: 'esta_activo',
    type: 'boolean',
    default: true,
  })
  estaActivo: boolean;

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
  @ManyToOne('Usuario', 'carritos', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @OneToMany('CarritoItem', 'carrito', {
    cascade: true,
  })
  items: CarritoItem[];
}

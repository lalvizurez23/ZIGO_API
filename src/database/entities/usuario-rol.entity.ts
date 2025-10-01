import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Rol } from './rol.entity';

@Entity('usuario_rol')
@Index('IX_usuario_rol', ['idUsuarioRol'])
@Index('IX_usuario_rol_usuario', ['idUsuario'])
@Index('IX_usuario_rol_rol', ['idRol'])
export class UsuarioRol {
  @PrimaryGeneratedColumn({ name: 'id_usuario_rol' })
  idUsuarioRol: number;

  @Column({ name: 'id_usuario', nullable: false })
  idUsuario: number;

  @Column({ name: 'id_rol', nullable: false })
  idRol: number;

  @CreateDateColumn({
    name: 'fecha_asignacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaAsignacion: Date;

  @Column({
    name: 'asignado_por',
    type: 'int',
    nullable: true,
  })
  asignadoPor: number;

  // Relaciones
  @ManyToOne(() => Usuario, (usuario) => usuario.usuarioRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Rol, (rol) => rol.usuarioRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_rol' })
  rol: Rol;

  @ManyToOne(() => Usuario, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'asignado_por' })
  asignadoPorUsuario: Usuario;
}


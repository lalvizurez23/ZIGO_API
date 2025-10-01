import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UsuarioRol } from './usuario-rol.entity.js';
import { LogsSesion } from './logs-sesion.entity.js';

@Entity('usuario')
@Index('IX_usuarios_email', ['email'])
@Index('IX_usuarios_activo', ['estaActivo'])
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
    name: 'password_encryptado',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  passwordEncryptado: string;

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
    name: 'esta_activo',
    type: 'boolean',
    default: true,
  })
  estaActivo: boolean;

  @Column({
    name: 'fecha_ultimo_acceso',
    type: 'timestamp',
    nullable: true,
  })
  fechaUltimoAcceso: Date;

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
  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.usuario)
  usuarioRoles: UsuarioRol[];

  @OneToMany(() => LogsSesion, (logsSesion) => logsSesion.usuario)
  logsSesion: LogsSesion[];
}


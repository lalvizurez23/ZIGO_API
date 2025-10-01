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

@Entity('logs_sesion')
@Index('IX_logs_sesion_usuario', ['idUsuario'])
@Index('IX_logs_sesion_fecha', ['fechaLogin'])
@Index('IX_logs_sesion_exito', ['exito'])
export class LogsSesion {
  @PrimaryGeneratedColumn({ name: 'id_log' })
  idLog: number;

  @Column({ name: 'id_usuario', nullable: false })
  idUsuario: number;

  @CreateDateColumn({
    name: 'fecha_login',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaLogin: Date;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ipAddress: string;

  @Column({
    name: 'user_agent',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  userAgent: string;

  @Column({
    name: 'exito',
    type: 'boolean',
    default: true,
  })
  exito: boolean;

  @Column({
    name: 'mensaje_error',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mensajeError: string;

  // Relaciones
  @ManyToOne(() => Usuario, (usuario) => usuario.logsSesion, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}


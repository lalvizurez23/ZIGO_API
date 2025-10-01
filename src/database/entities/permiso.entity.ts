import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { RolPermiso } from './rol-permiso.entity.js';

@Entity('permiso')
@Index('IX_permisos_recurso', ['recurso'])
@Index('IX_permisos_accion', ['accion'])
@Index('IX_permisos_recurso_accion', ['recurso', 'accion'])
export class Permiso {
  @PrimaryGeneratedColumn({ name: 'id_permiso' })
  idPermiso: number;

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
    length: 255,
    nullable: true,
  })
  descripcion: string;

  @Column({
    name: 'recurso',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  recurso: string;

  @Column({
    name: 'accion',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  accion: string;

  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCreacion: Date;

  // Relaciones
  @OneToMany(() => RolPermiso, (rolPermiso) => rolPermiso.permiso)
  rolPermisos: RolPermiso[];
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Rol } from './rol.entity';
import { Permiso } from './permiso.entity';

@Entity('rol_permiso')
@Index('IX_rol_permiso', ['idRolPermiso'])
@Index('IX_rol_permiso_rol', ['idRol'])
@Index('IX_rol_permiso_permiso', ['idPermiso'])
export class RolPermiso {
  @PrimaryGeneratedColumn({ name: 'id_rol_permiso' })
  idRolPermiso: number;

  @Column({ name: 'id_rol', nullable: false })
  idRol: number;

  @Column({ name: 'id_permiso', nullable: false })
  idPermiso: number;

  @CreateDateColumn({
    name: 'fecha_asignacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaAsignacion: Date;

  // Relaciones
  @ManyToOne(() => Rol, (rol) => rol.rolPermisos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_rol' })
  rol: Rol;

  @ManyToOne(() => Permiso, (permiso) => permiso.rolPermisos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_permiso' })
  permiso: Permiso;
}


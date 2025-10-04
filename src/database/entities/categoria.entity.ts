import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import type { Producto } from './producto.entity';

@Entity('categoria')
@Index('IX_categorias_nombre', ['nombre'])
export class Categoria {
  @PrimaryGeneratedColumn({ name: 'id_categoria' })
  idCategoria: number;

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
    name: 'imagen_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  imagenUrl: string;

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
  @OneToMany('Producto', 'categoria')
  productos: Producto[];
}

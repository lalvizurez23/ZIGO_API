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
  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];
}

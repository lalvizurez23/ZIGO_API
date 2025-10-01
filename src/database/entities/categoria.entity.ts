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
import { Producto } from './producto.entity';

@Entity('categoria')
@Index('IX_categorias_nombre', ['nombre'])
@Index('IX_categorias_activo', ['estaActivo'])
@Index('IX_categorias_padre', ['categoriaPadreId'])
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
    name: 'categoria_padre_id',
    type: 'int',
    nullable: true,
  })
  categoriaPadreId: number;

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

  @Column({
    name: 'orden',
    type: 'int',
    default: 0,
  })
  orden: number;

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
  @ManyToOne(() => Categoria, (categoria) => categoria.subcategorias, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'categoria_padre_id' })
  categoriaPadre: Categoria;

  @OneToMany(() => Categoria, (categoria) => categoria.categoriaPadre)
  subcategorias: Categoria[];

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Producto } from './producto.entity';

@Entity('producto_imagen')
@Index('IX_producto_imagenes_producto', ['idProducto'])
export class ProductoImagen {
  @PrimaryGeneratedColumn({ name: 'id_producto_imagen' })
  idProductoImagen: number;

  @Column({ name: 'id_producto', nullable: false })
  idProducto: number;

  @Column({
    name: 'url_imagen',
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  urlImagen: string;

  @Column({
    name: 'alt_text',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  altText: string;

  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCreacion: Date;

  // Relaciones
  @ManyToOne(() => Producto, (producto) => producto.imagenes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { HistorialEstadoPedido } from './historial-estado-pedido.entity';

@Entity('estado_pedido')
@Index('IX_estado_pedido_nombre', ['nombre'])
export class EstadoPedido {
  @PrimaryGeneratedColumn({ name: 'id_estado_pedido' })
  idEstadoPedido: number;

  @Column({
    name: 'nombre',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  nombre: string;

  @Column({
    name: 'descripcion',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  descripcion: string;

  @Column({
    name: 'es_estado_final',
    type: 'boolean',
    default: false,
  })
  esEstadoFinal: boolean;

  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCreacion: Date;

  // Relaciones
  @OneToMany(() => Pedido, (pedido) => pedido.estadoPedido)
  pedidos: Pedido[];

  @OneToMany(() => HistorialEstadoPedido, (historial) => historial.estadoAnterior)
  historialesComoAnterior: HistorialEstadoPedido[];

  @OneToMany(() => HistorialEstadoPedido, (historial) => historial.estadoNuevo)
  historialesComoNuevo: HistorialEstadoPedido[];
}


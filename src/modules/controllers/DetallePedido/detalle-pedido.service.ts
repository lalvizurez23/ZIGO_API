import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetallePedido } from '../../../database/entities/detalle-pedido.entity';
import { Pedido } from '../../../database/entities/pedido.entity';
import { Producto } from '../../../database/entities/producto.entity';
import { CreateDetallePedidoDto } from './dto/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from './dto/update-detalle-pedido.dto';

@Injectable()
export class DetallePedidoService {
  constructor(
    @InjectRepository(DetallePedido)
    private detallePedidoRepository: Repository<DetallePedido>,
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  async create(createDetallePedidoDto: CreateDetallePedidoDto): Promise<DetallePedido> {
    // Verificar que el pedido existe
    const pedido = await this.pedidoRepository.findOne({
      where: { idPedido: createDetallePedidoDto.idPedido },
    });

    if (!pedido) {
      throw new BadRequestException('El pedido especificado no existe');
    }

    // Verificar que el producto existe
    const producto = await this.productoRepository.findOne({
      where: { idProducto: createDetallePedidoDto.idProducto },
    });

    if (!producto) {
      throw new BadRequestException('El producto especificado no existe');
    }

    // Verificar que el pedido no esté completado o cancelado
    if (pedido.estado === 'completado' || pedido.estado === 'cancelado') {
      throw new BadRequestException('No se puede modificar un pedido completado o cancelado');
    }

    // Verificar si ya existe un detalle para este producto en el pedido
    const detalleExistente = await this.detallePedidoRepository.findOne({
      where: {
        idPedido: createDetallePedidoDto.idPedido,
        idProducto: createDetallePedidoDto.idProducto,
      },
    });

    if (detalleExistente) {
      throw new BadRequestException('Ya existe un detalle para este producto en el pedido');
    }

    try {
      const detallePedido = this.detallePedidoRepository.create(createDetallePedidoDto);
      return await this.detallePedidoRepository.save(detallePedido);
    } catch (error) {
      throw new BadRequestException('Error al crear el detalle del pedido');
    }
  }

  async findAll(options: {
    page: number;
    limit: number;
    pedido?: number;
    producto?: number;
  }): Promise<{ data: DetallePedido[]; total: number; page: number; limit: number }> {
    const { page, limit, pedido, producto } = options;
    const queryBuilder = this.detallePedidoRepository
      .createQueryBuilder('detallePedido')
      .leftJoinAndSelect('detallePedido.pedido', 'pedido')
      .leftJoinAndSelect('detallePedido.producto', 'producto');

    if (pedido) {
      queryBuilder.where('detallePedido.idPedido = :pedido', { pedido });
    }

    if (producto) {
      queryBuilder.andWhere('detallePedido.idProducto = :producto', { producto });
    }

    queryBuilder
      .orderBy('detallePedido.idDetallePedido', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<DetallePedido> {
    const detallePedido = await this.detallePedidoRepository.findOne({
      where: { idDetallePedido: id },
      relations: ['pedido', 'producto'],
    });

    if (!detallePedido) {
      throw new NotFoundException(`DetallePedido con ID ${id} no encontrado`);
    }

    return detallePedido;
  }

  async update(id: number, updateDetallePedidoDto: UpdateDetallePedidoDto): Promise<DetallePedido> {
    const detallePedido = await this.findOne(id);

    // Verificar que el pedido no esté completado o cancelado
    if (detallePedido.pedido.estado === 'completado' || detallePedido.pedido.estado === 'cancelado') {
      throw new BadRequestException('No se puede modificar un detalle de un pedido completado o cancelado');
    }

    try {
      Object.assign(detallePedido, updateDetallePedidoDto);
      return await this.detallePedidoRepository.save(detallePedido);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el detalle del pedido');
    }
  }

  async remove(id: number): Promise<void> {
    const detallePedido = await this.findOne(id);

    // Verificar que el pedido no esté completado o cancelado
    if (detallePedido.pedido.estado === 'completado' || detallePedido.pedido.estado === 'cancelado') {
      throw new BadRequestException('No se puede eliminar un detalle de un pedido completado o cancelado');
    }

    await this.detallePedidoRepository.remove(detallePedido);
  }

  async findByPedido(pedidoId: number): Promise<DetallePedido[]> {
    const detalles = await this.detallePedidoRepository.find({
      where: { idPedido: pedidoId },
      relations: ['pedido', 'producto'],
      order: { idDetallePedido: 'ASC' },
    });

    return detalles;
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pedido } from '../../../database/entities/pedido.entity';
import { EstadoPedido } from './dto/create-pedido.dto';
import { Usuario } from '../../../database/entities/usuario.entity';
import { Carrito } from '../../../database/entities/carrito.entity';
import { CarritoItem } from '../../../database/entities/carrito-item.entity';
import { DetallePedido } from '../../../database/entities/detalle-pedido.entity';
import { Producto } from '../../../database/entities/producto.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Carrito)
    private carritoRepository: Repository<Carrito>,
    @InjectRepository(CarritoItem)
    private carritoItemRepository: Repository<CarritoItem>,
    @InjectRepository(DetallePedido)
    private detallePedidoRepository: Repository<DetallePedido>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    private dataSource: DataSource,
  ) {}

  async create(createPedidoDto: CreatePedidoDto, usuarioId: number): Promise<Pedido> {
    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: usuarioId },
    });

    if (!usuario) {
      throw new BadRequestException('El usuario especificado no existe');
    }

    // Generar número de pedido único
    const numeroPedido = await this.generarNumeroPedido();
    const fechaPedido = new Date();

    try {
      const pedido = this.pedidoRepository.create({
        ...createPedidoDto,
        idUsuario: usuarioId,
        numeroPedido,
        fechaPedido,
      });
      return await this.pedidoRepository.save(pedido);
    } catch (error) {
      throw new BadRequestException('Error al crear el pedido');
    }
  }

  async findAll(options: {
    page: number;
    limit: number;
    usuario?: number;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<{ data: Pedido[]; total: number; page: number; limit: number }> {
    const { page, limit, usuario, estado, fechaInicio, fechaFin } = options;
    const queryBuilder = this.pedidoRepository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.usuario', 'usuario')
      .leftJoinAndSelect('pedido.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto');

    if (usuario) {
      queryBuilder.where('pedido.idUsuario = :usuario', { usuario });
    }

    if (estado) {
      queryBuilder.andWhere('pedido.estado = :estado', { estado });
    }

    if (fechaInicio) {
      queryBuilder.andWhere('pedido.fechaPedido >= :fechaInicio', { fechaInicio });
    }

    if (fechaFin) {
      queryBuilder.andWhere('pedido.fechaPedido <= :fechaFin', { fechaFin });
    }

    queryBuilder
      .orderBy('pedido.fechaPedido', 'DESC')
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

  async findByUsuario(usuarioId: number): Promise<Pedido[]> {
    const pedidos = await this.pedidoRepository.find({
      where: { idUsuario: usuarioId },
      relations: ['usuario', 'detalles', 'detalles.producto'],
      order: { fechaPedido: 'DESC' },
    });

    return pedidos;
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { idPedido: id },
      relations: ['usuario', 'detalles', 'detalles.producto'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return pedido;
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto): Promise<Pedido> {
    const pedido = await this.findOne(id);

    try {
      Object.assign(pedido, updatePedidoDto);
      return await this.pedidoRepository.save(pedido);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el pedido');
    }
  }

  async updateEstado(id: number, estado: string): Promise<Pedido> {
    const pedido = await this.findOne(id);

    // Validar que el estado sea válido
    if (!Object.values(EstadoPedido).includes(estado as EstadoPedido)) {
      throw new BadRequestException('Estado de pedido inválido');
    }

    pedido.estado = estado as EstadoPedido;
    return await this.pedidoRepository.save(pedido);
  }

  async cancelar(id: number): Promise<Pedido> {
    const pedido = await this.findOne(id);

    if (pedido.estado === EstadoPedido.CANCELADO) {
      throw new BadRequestException('El pedido ya está cancelado');
    }

    if (pedido.estado === EstadoPedido.COMPLETADO) {
      throw new BadRequestException('No se puede cancelar un pedido completado');
    }

    pedido.estado = EstadoPedido.CANCELADO;
    return await this.pedidoRepository.save(pedido);
  }

  async crearDesdeCarrito(
    carritoId: number,
    usuarioId: number,
    datosAdicionales: {
      metodoPago?: string;
      direccionEnvio?: string;
      notas?: string;
    },
  ): Promise<Pedido> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar que el carrito existe y pertenece al usuario
      const carrito = await queryRunner.manager.findOne(Carrito, {
        where: { 
          idCarrito: carritoId,
          idUsuario: usuarioId,
          estaActivo: true,
        },
        relations: ['items', 'items.producto'],
      });

      if (!carrito) {
        throw new BadRequestException('Carrito no encontrado o inactivo');
      }

      if (!carrito.items || carrito.items.length === 0) {
        throw new BadRequestException('El carrito está vacío');
      }

      // Calcular total
      let total = 0;
      for (const item of carrito.items) {
        total += item.producto.precio * item.cantidad;
      }

      // Crear el pedido
      const numeroPedido = await this.generarNumeroPedido();
      const pedido = queryRunner.manager.create(Pedido, {
        idUsuario: usuarioId,
        numeroPedido,
        total,
        estado: EstadoPedido.PENDIENTE,
        metodoPago: datosAdicionales.metodoPago,
        direccionEnvio: datosAdicionales.direccionEnvio,
        notas: datosAdicionales.notas,
      });

      const pedidoGuardado = await queryRunner.manager.save(pedido);

      // Crear los detalles del pedido
      for (const item of carrito.items) {
        const detallePedido = queryRunner.manager.create(DetallePedido, {
          idPedido: pedidoGuardado.idPedido,
          idProducto: item.idProducto,
          cantidad: item.cantidad,
          precioUnitario: item.producto.precio,
          subtotal: item.producto.precio * item.cantidad,
        });

        await queryRunner.manager.save(detallePedido);
      }

      // Desactivar el carrito
      carrito.estaActivo = false;
      await queryRunner.manager.save(carrito);

      await queryRunner.commitTransaction();

      return await this.findOne(pedidoGuardado.idPedido);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async checkout(
    usuarioId: number,
    datosCheckout: {
      direccionEnvio: string;
      numeroTarjeta: string;
      nombreTarjeta: string;
      fechaExpiracion: string;
      cvv: string;
    },
  ): Promise<Pedido> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Obtener el carrito activo del usuario
      const carrito = await queryRunner.manager.findOne(Carrito, {
        where: { 
          idUsuario: usuarioId,
          estaActivo: true,
        },
        relations: ['items', 'items.producto'],
      });

      if (!carrito) {
        throw new BadRequestException('No tienes un carrito activo');
      }

      if (!carrito.items || carrito.items.length === 0) {
        throw new BadRequestException('El carrito está vacío');
      }

      // 2. Verificar stock disponible para todos los productos
      for (const item of carrito.items) {
        const producto = await queryRunner.manager.findOne(Producto, {
          where: { idProducto: item.idProducto },
        });

        if (!producto) {
          throw new BadRequestException(`Producto ${item.idProducto} no encontrado`);
        }

        if (!producto.estaActivo) {
          throw new BadRequestException(`El producto "${producto.nombre}" ya no está disponible`);
        }

        if (producto.stock < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, Solicitado: ${item.cantidad}`
          );
        }
      }

      // 3. Calcular total
      let total = 0;
      for (const item of carrito.items) {
        const precio = typeof item.producto.precio === 'string' 
          ? parseFloat(item.producto.precio) 
          : item.producto.precio;
        total += precio * item.cantidad;
      }

      // 4. Crear el pedido
      const numeroPedido = await this.generarNumeroPedido();
      const pedido = queryRunner.manager.create(Pedido, {
        idUsuario: usuarioId,
        numeroPedido,
        total,
        estado: EstadoPedido.PENDIENTE,
        metodoPago: 'Tarjeta de Crédito',
        direccionEnvio: datosCheckout.direccionEnvio,
        notas: `Tarjeta terminada en ${datosCheckout.numeroTarjeta.slice(-4)}`,
      });

      const pedidoGuardado = await queryRunner.manager.save(pedido);

      // 5. Crear los detalles del pedido y actualizar stock
      for (const item of carrito.items) {
        const precio = typeof item.producto.precio === 'string' 
          ? parseFloat(item.producto.precio) 
          : item.producto.precio;

        // Crear detalle del pedido
        const detallePedido = queryRunner.manager.create(DetallePedido, {
          idPedido: pedidoGuardado.idPedido,
          idProducto: item.idProducto,
          cantidad: item.cantidad,
          precioUnitario: precio,
          subtotal: precio * item.cantidad,
        });

        await queryRunner.manager.save(detallePedido);

        // Actualizar stock del producto
        await queryRunner.manager.decrement(
          Producto,
          { idProducto: item.idProducto },
          'stock',
          item.cantidad
        );
      }

      // 6. Vaciar el carrito (eliminar items)
      await queryRunner.manager.delete(CarritoItem, {
        idCarrito: carrito.idCarrito,
      });

      await queryRunner.commitTransaction();

      // Retornar el pedido completo
      return await this.findOne(pedidoGuardado.idPedido);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generarNumeroPedido(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PED-${timestamp}-${random}`;
  }
}

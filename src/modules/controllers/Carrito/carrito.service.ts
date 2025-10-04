import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrito } from '../../../database/entities/carrito.entity';
import { CarritoItem } from '../../../database/entities/carrito-item.entity';
import { Producto } from '../../../database/entities/producto.entity';
import { Usuario } from '../../../database/entities/usuario.entity';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito)
    private carritoRepository: Repository<Carrito>,
    @InjectRepository(CarritoItem)
    private carritoItemRepository: Repository<CarritoItem>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async create(usuarioId: number): Promise<Carrito> {
    // Verificar que el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: usuarioId },
    });

    if (!usuario) {
      throw new BadRequestException('El usuario especificado no existe');
    }

    // Verificar si ya existe un carrito activo para este usuario
    const carritoExistente = await this.carritoRepository.findOne({
      where: { 
        idUsuario: usuarioId,
        estaActivo: true,
      },
    });

    if (carritoExistente) {
      throw new BadRequestException('El usuario ya tiene un carrito activo');
    }

    try {
      const carrito = this.carritoRepository.create({
        estaActivo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        idUsuario: usuarioId,
      });
      return await this.carritoRepository.save(carrito);
    } catch (error) {
      throw new BadRequestException('Error al crear el carrito');
    }
  }

  async findAll(options: {
    page: number;
    limit: number;
    usuario?: number;
    activo?: boolean;
  }): Promise<{ data: Carrito[]; total: number; page: number; limit: number }> {
    const { page, limit, usuario, activo } = options;
    const queryBuilder = this.carritoRepository
      .createQueryBuilder('carrito')
      .leftJoinAndSelect('carrito.usuario', 'usuario')
      .leftJoinAndSelect('carrito.items', 'items')
      .leftJoinAndSelect('items.producto', 'producto');

    if (usuario) {
      queryBuilder.where('carrito.idUsuario = :usuario', { usuario });
    }

    if (activo !== undefined) {
      queryBuilder.andWhere('carrito.estaActivo = :activo', { activo });
    }

    queryBuilder
      .orderBy('carrito.fechaCreacion', 'DESC')
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

  async findByUsuario(usuarioId: number): Promise<Carrito | null> {
    const carrito = await this.carritoRepository.findOne({
      where: { 
        idUsuario: usuarioId,
        estaActivo: true,
      },
      relations: ['usuario', 'items', 'items.producto'],
    });

    return carrito;
  }

  async findOne(id: number): Promise<Carrito> {
    const carrito = await this.carritoRepository.findOne({
      where: { idCarrito: id },
      relations: ['usuario', 'items', 'items.producto'],
    });

    if (!carrito) {
      throw new NotFoundException(`Carrito con ID ${id} no encontrado`);
    }

    return carrito;
  }

  async update(id: number, updateCarritoDto: UpdateCarritoDto): Promise<Carrito> {
    const carrito = await this.findOne(id);

    try {
      Object.assign(carrito, updateCarritoDto);
      return await this.carritoRepository.save(carrito);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el carrito');
    }
  }

  async activate(id: number): Promise<Carrito> {
    const carrito = await this.findOne(id);
    
    // Verificar que no haya otro carrito activo para el mismo usuario
    const carritoActivoExistente = await this.carritoRepository.findOne({
      where: { 
        idUsuario: carrito.idUsuario,
        estaActivo: true,
        idCarrito: id,
      },
    });

    if (carritoActivoExistente && carritoActivoExistente.idCarrito !== id) {
      throw new BadRequestException('El usuario ya tiene un carrito activo');
    }

    carrito.estaActivo = true;
    return await this.carritoRepository.save(carrito);
  }

  async deactivate(id: number): Promise<Carrito> {
    const carrito = await this.findOne(id);
    carrito.estaActivo = false;
    return await this.carritoRepository.save(carrito);
  }

  async vaciar(id: number): Promise<Carrito> {
    const carrito = await this.findOne(id);
    
    // Eliminar todos los items del carrito
    await this.carritoRepository
      .createQueryBuilder()
      .delete()
      .from('carrito_item')
      .where('id_carrito = :id', { id })
      .execute();

    return await this.findOne(id);
  }

  // Métodos para manejar items del carrito
  async addItemToCart(cartId: number, productoId: number, cantidad: number): Promise<Carrito> {
    // Obtener carrito por ID
    const carrito = await this.findOne(cartId);

    // Verificar que el producto existe y está activo
    const producto = await this.productoRepository.findOne({
      where: { idProducto: productoId },
    });

    if (!producto) {
      throw new BadRequestException('El producto especificado no existe');
    }

    if (!producto.estaActivo) {
      throw new BadRequestException('No se puede agregar un producto inactivo al carrito');
    }

    // Verificar stock disponible
    if (cantidad > producto.stock) {
      throw new BadRequestException('No hay suficiente stock disponible');
    }

    // Verificar si ya existe un item para este producto en el carrito
    const itemExistente = await this.carritoItemRepository.findOne({
      where: {
        idCarrito: carrito.idCarrito,
        idProducto: productoId
      },
    });

    if (itemExistente) {
      // Si ya existe, actualizar la cantidad
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      
      // Verificar stock nuevamente
      if (nuevaCantidad > producto.stock) {
        throw new BadRequestException('No hay suficiente stock disponible');
      }

      itemExistente.cantidad = nuevaCantidad;
      await this.carritoItemRepository.save(itemExistente);
    } else {
      // Crear nuevo item
      const nuevoItem = this.carritoItemRepository.create({
        idCarrito: carrito.idCarrito,
        idProducto: productoId,
        cantidad,
        fechaAgregado: new Date(),
      });
      await this.carritoItemRepository.save(nuevoItem);
    }

    // Retornar el carrito actualizado
    return await this.findOne(cartId);
  }

  async updateItemQuantity(usuarioId: number, itemId: number, cantidad: number): Promise<Carrito> {
    if (cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    const carrito = await this.findByUsuario(usuarioId);
    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }

    const item = await this.carritoItemRepository.findOne({
      where: { 
        idCarritoItem: itemId,
        idCarrito: carrito.idCarrito,
      },
    });

    if (!item) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    const producto = await this.productoRepository.findOne({
      where: { idProducto: item.idProducto },
    });

    if (!producto) {
      throw new BadRequestException('El producto asociado no existe');
    }

    if (cantidad > producto.stock) {
      throw new BadRequestException('No hay suficiente stock disponible');
    }

    item.cantidad = cantidad;
    await this.carritoItemRepository.save(item);

    return await this.findByUsuario(usuarioId);
  }

  async removeItemFromCart(usuarioId: number, itemId: number): Promise<Carrito> {
    const carrito = await this.findByUsuario(usuarioId);
    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }

    const item = await this.carritoItemRepository.findOne({
      where: { 
        idCarritoItem: itemId,
        idCarrito: carrito.idCarrito,
      },
    });

    if (!item) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    await this.carritoItemRepository.remove(item);

    return await this.findByUsuario(usuarioId);
  }

  async clearUserCart(usuarioId: number): Promise<Carrito> {
    const carrito = await this.findByUsuario(usuarioId);
    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }

    // Eliminar todos los items del carrito
    await this.carritoItemRepository
      .createQueryBuilder()
      .delete()
      .where('id_carrito = :id', { id: carrito.idCarrito })
      .execute();

    return await this.findByUsuario(usuarioId);
  }
}

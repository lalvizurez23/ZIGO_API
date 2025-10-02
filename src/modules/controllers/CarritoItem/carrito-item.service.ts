import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoItem } from '../../../database/entities/carrito-item.entity';
import { Carrito } from '../../../database/entities/carrito.entity';
import { Producto } from '../../../database/entities/producto.entity';
import { CreateCarritoItemDto } from './dto/create-carrito-item.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';

@Injectable()
export class CarritoItemService {
  constructor(
    @InjectRepository(CarritoItem)
    private carritoItemRepository: Repository<CarritoItem>,
    @InjectRepository(Carrito)
    private carritoRepository: Repository<Carrito>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  async create(createCarritoItemDto: CreateCarritoItemDto): Promise<CarritoItem> {
    // Verificar que el carrito existe y está activo
    const carrito = await this.carritoRepository.findOne({
      where: { idCarrito: createCarritoItemDto.idCarrito },
    });

    if (!carrito) {
      throw new BadRequestException('El carrito especificado no existe');
    }

    if (!carrito.estaActivo) {
      throw new BadRequestException('No se puede agregar items a un carrito inactivo');
    }

    // Verificar que el producto existe y está activo
    const producto = await this.productoRepository.findOne({
      where: { idProducto: createCarritoItemDto.idProducto },
    });

    if (!producto) {
      throw new BadRequestException('El producto especificado no existe');
    }

    if (!producto.estaActivo) {
      throw new BadRequestException('No se puede agregar un producto inactivo al carrito');
    }

    // Verificar stock disponible
    if (createCarritoItemDto.cantidad > producto.stock) {
      throw new BadRequestException('No hay suficiente stock disponible');
    }

    // Verificar si ya existe un item para este producto en el carrito
    const itemExistente = await this.carritoItemRepository.findOne({
      where: {
        idCarrito: createCarritoItemDto.idCarrito,
        idProducto: createCarritoItemDto.idProducto,
      },
    });

    if (itemExistente) {
      // Si ya existe, actualizar la cantidad
      itemExistente.cantidad += createCarritoItemDto.cantidad;
      
      // Verificar stock nuevamente
      if (itemExistente.cantidad > producto.stock) {
        throw new BadRequestException('No hay suficiente stock disponible');
      }

      return await this.carritoItemRepository.save(itemExistente);
    }

    try {
      const carritoItem = this.carritoItemRepository.create(createCarritoItemDto);
      return await this.carritoItemRepository.save(carritoItem);
    } catch (error) {
      throw new BadRequestException('Error al crear el item del carrito');
    }
  }

  async findAll(options: {
    page: number;
    limit: number;
    carrito?: number;
    producto?: number;
  }): Promise<{ data: CarritoItem[]; total: number; page: number; limit: number }> {
    const { page, limit, carrito, producto } = options;
    const queryBuilder = this.carritoItemRepository
      .createQueryBuilder('carritoItem')
      .leftJoinAndSelect('carritoItem.carrito', 'carrito')
      .leftJoinAndSelect('carritoItem.producto', 'producto');

    if (carrito) {
      queryBuilder.where('carritoItem.idCarrito = :carrito', { carrito });
    }

    if (producto) {
      queryBuilder.andWhere('carritoItem.idProducto = :producto', { producto });
    }

    queryBuilder
      .orderBy('carritoItem.fechaAgregado', 'DESC')
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

  async findOne(id: number): Promise<CarritoItem> {
    const carritoItem = await this.carritoItemRepository.findOne({
      where: { idCarritoItem: id },
      relations: ['carrito', 'producto'],
    });

    if (!carritoItem) {
      throw new NotFoundException(`CarritoItem con ID ${id} no encontrado`);
    }

    return carritoItem;
  }

  async update(id: number, updateCarritoItemDto: UpdateCarritoItemDto): Promise<CarritoItem> {
    const carritoItem = await this.findOne(id);

    // Si se está actualizando la cantidad, verificar stock
    if (updateCarritoItemDto.cantidad !== undefined) {
      const producto = await this.productoRepository.findOne({
        where: { idProducto: carritoItem.idProducto },
      });

      if (!producto) {
        throw new BadRequestException('El producto asociado no existe');
      }

      if (updateCarritoItemDto.cantidad > producto.stock) {
        throw new BadRequestException('No hay suficiente stock disponible');
      }

      if (updateCarritoItemDto.cantidad <= 0) {
        throw new BadRequestException('La cantidad debe ser mayor a 0');
      }
    }

    try {
      Object.assign(carritoItem, updateCarritoItemDto);
      return await this.carritoItemRepository.save(carritoItem);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el item del carrito');
    }
  }

  async remove(id: number): Promise<void> {
    const carritoItem = await this.findOne(id);
    await this.carritoItemRepository.remove(carritoItem);
  }

  async updateCantidad(id: number, cantidad: number): Promise<CarritoItem> {
    if (cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a 0');
    }

    const carritoItem = await this.findOne(id);
    
    const producto = await this.productoRepository.findOne({
      where: { idProducto: carritoItem.idProducto },
    });

    if (!producto) {
      throw new BadRequestException('El producto asociado no existe');
    }

    if (cantidad > producto.stock) {
      throw new BadRequestException('No hay suficiente stock disponible');
    }

    carritoItem.cantidad = cantidad;
    return await this.carritoItemRepository.save(carritoItem);
  }

  async addProductoToCarrito(
    carritoId: number,
    productoId: number,
    cantidad: number,
  ): Promise<CarritoItem> {
    const createDto: CreateCarritoItemDto = {
      idCarrito: carritoId,
      idProducto: productoId,
      cantidad,
    };

    return await this.create(createDto);
  }
}

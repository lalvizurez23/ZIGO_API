import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../../../database/entities/producto.entity';
import { Categoria } from '../../../database/entities/categoria.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    // Verificar que la categoría existe
    const categoria = await this.categoriaRepository.findOne({
      where: { idCategoria: createProductoDto.idCategoria },
    });

    if (!categoria) {
      throw new BadRequestException('La categoría especificada no existe');
    }

    if (!categoria.estaActivo) {
      throw new BadRequestException('No se puede crear un producto en una categoría inactiva');
    }

    try {
      const producto = this.productoRepository.create(createProductoDto);
      return await this.productoRepository.save(producto);
    } catch (error) {
      throw new BadRequestException('Error al crear el producto');
    }
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    categoria?: number;
    activo?: boolean;
    precioMin?: number;
    precioMax?: number;
  }): Promise<{ data: Producto[]; total: number; page: number; limit: number }> {
    const { page, limit, search, categoria, activo, precioMin, precioMax } = options;
    const queryBuilder = this.productoRepository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categoria', 'categoria');

    if (search) {
      queryBuilder.where(
        '(producto.nombre LIKE :search OR producto.descripcion LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoria) {
      queryBuilder.andWhere('producto.idCategoria = :categoria', { categoria });
    }

    if (activo !== undefined) {
      queryBuilder.andWhere('producto.estaActivo = :activo', { activo });
    }

    if (precioMin !== undefined) {
      queryBuilder.andWhere('producto.precio >= :precioMin', { precioMin });
    }

    if (precioMax !== undefined) {
      queryBuilder.andWhere('producto.precio <= :precioMax', { precioMax });
    }

    queryBuilder
      .orderBy('producto.fechaCreacion', 'DESC')
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

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { idProducto: id },
      relations: ['categoria', 'detallesPedido', 'carritoItems'],
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.findOne(id);

    // Si se está actualizando la categoría, verificar que existe
    if (updateProductoDto.idCategoria) {
      const categoria = await this.categoriaRepository.findOne({
        where: { idCategoria: updateProductoDto.idCategoria },
      });

      if (!categoria) {
        throw new BadRequestException('La categoría especificada no existe');
      }

      if (!categoria.estaActivo) {
        throw new BadRequestException('No se puede asignar un producto a una categoría inactiva');
      }
    }

    try {
      Object.assign(producto, updateProductoDto);
      return await this.productoRepository.save(producto);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el producto');
    }
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);
    
    // Verificar si tiene pedidos o carrito items asociados
    const detallesCount = await this.productoRepository
      .createQueryBuilder('producto')
      .leftJoin('producto.detallesPedido', 'detalle')
      .leftJoin('producto.carritoItems', 'carritoItem')
      .where('producto.idProducto = :id', { id })
      .andWhere('(detalle.idDetallePedido IS NOT NULL OR carritoItem.idCarritoItem IS NOT NULL)')
      .getCount();

    if (detallesCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar el producto porque tiene pedidos o carrito items asociados',
      );
    }

    await this.productoRepository.remove(producto);
  }

  async activate(id: number): Promise<Producto> {
    const producto = await this.findOne(id);
    producto.estaActivo = true;
    return await this.productoRepository.save(producto);
  }

  async deactivate(id: number): Promise<Producto> {
    const producto = await this.findOne(id);
    producto.estaActivo = false;
    return await this.productoRepository.save(producto);
  }

  async updateStock(id: number, cantidad: number): Promise<Producto> {
    const producto = await this.findOne(id);
    
    if (cantidad < 0) {
      throw new BadRequestException('La cantidad no puede ser negativa');
    }

    producto.stock = cantidad;
    return await this.productoRepository.save(producto);
  }
}

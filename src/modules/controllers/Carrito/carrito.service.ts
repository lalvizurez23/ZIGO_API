import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrito } from '../../../database/entities/carrito.entity';
import { Usuario } from '../../../database/entities/usuario.entity';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito)
    private carritoRepository: Repository<Carrito>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createCarritoDto: CreateCarritoDto, usuarioId: number): Promise<Carrito> {
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
        ...createCarritoDto,
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

  async remove(id: number): Promise<void> {
    const carrito = await this.findOne(id);
    await this.carritoRepository.remove(carrito);
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
}

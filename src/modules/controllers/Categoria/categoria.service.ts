import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../../../database/entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    try {
      const categoria = this.categoriaRepository.create(createCategoriaDto);
      return await this.categoriaRepository.save(categoria);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('Ya existe una categoría con ese nombre');
      }
      throw error;
    }
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    activo?: boolean;
  }): Promise<{ data: Categoria[]; total: number; page: number; limit: number }> {
    const { page, limit, search, activo } = options;
    const queryBuilder = this.categoriaRepository.createQueryBuilder('categoria');

    if (search) {
      queryBuilder.where(
        '(categoria.nombre LIKE :search OR categoria.descripcion LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (activo !== undefined) {
      queryBuilder.andWhere('categoria.estaActivo = :activo', { activo });
    }

    queryBuilder
      .orderBy('categoria.fechaCreacion', 'DESC')
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

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { idCategoria: id },
      relations: ['productos'],
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.findOne(id);

    try {
      Object.assign(categoria, updateCategoriaDto);
      return await this.categoriaRepository.save(categoria);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('Ya existe una categoría con ese nombre');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const categoria = await this.findOne(id);
    
    // Verificar si tiene productos asociados
    const productosCount = await this.categoriaRepository
      .createQueryBuilder('categoria')
      .leftJoin('categoria.productos', 'producto')
      .where('categoria.idCategoria = :id', { id })
      .andWhere('producto.idProducto IS NOT NULL')
      .getCount();

    if (productosCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar la categoría porque tiene productos asociados',
      );
    }

    await this.categoriaRepository.remove(categoria);
  }

  async activate(id: number): Promise<Categoria> {
    const categoria = await this.findOne(id);
    categoria.estaActivo = true;
    return await this.categoriaRepository.save(categoria);
  }

  async deactivate(id: number): Promise<Categoria> {
    const categoria = await this.findOne(id);
    categoria.estaActivo = false;
    return await this.categoriaRepository.save(categoria);
  }
}

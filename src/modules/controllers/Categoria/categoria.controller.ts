import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';

@Controller('categorias')
@UseGuards(JwtAuthGuard)
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Post()
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return await this.categoriaService.create(createCategoriaDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('activo') activo?: boolean,
  ) {
    return await this.categoriaService.findAll({
      page,
      limit,
      search,
      activo,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriaService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return await this.categoriaService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriaService.remove(id);
  }

  @Put(':id/activar')
  async activate(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriaService.activate(id);
  }

  @Put(':id/desactivar')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriaService.deactivate(id);
  }
}

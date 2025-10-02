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
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';

@Controller('productos')
@UseGuards(JwtAuthGuard)
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  async create(@Body() createProductoDto: CreateProductoDto) {
    return await this.productoService.create(createProductoDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('categoria') categoria?: number,
    @Query('activo') activo?: boolean,
    @Query('precioMin') precioMin?: number,
    @Query('precioMax') precioMax?: number,
  ) {
    return await this.productoService.findAll({
      page,
      limit,
      search,
      categoria,
      activo,
      precioMin,
      precioMax,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productoService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return await this.productoService.update(id, updateProductoDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.productoService.remove(id);
  }

  @Put(':id/activar')
  async activate(@Param('id', ParseIntPipe) id: number) {
    return await this.productoService.activate(id);
  }

  @Put(':id/desactivar')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return await this.productoService.deactivate(id);
  }

  @Put(':id/stock')
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { cantidad: number },
  ) {
    return await this.productoService.updateStock(id, body.cantidad);
  }
}

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
import { CarritoItemService } from './carrito-item.service';
import { CreateCarritoItemDto } from './dto/create-carrito-item.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';

@Controller('carrito-items')
@UseGuards(JwtAuthGuard)
export class CarritoItemController {
  constructor(private readonly carritoItemService: CarritoItemService) {}

  @Post()
  async create(@Body() createCarritoItemDto: CreateCarritoItemDto) {
    return await this.carritoItemService.create(createCarritoItemDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('carrito') carrito?: number,
    @Query('producto') producto?: number,
  ) {
    return await this.carritoItemService.findAll({
      page,
      limit,
      carrito,
      producto,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.carritoItemService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCarritoItemDto: UpdateCarritoItemDto,
  ) {
    return await this.carritoItemService.update(id, updateCarritoItemDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.carritoItemService.remove(id);
  }

  @Put(':id/cantidad')
  async updateCantidad(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { cantidad: number },
  ) {
    return await this.carritoItemService.updateCantidad(id, body.cantidad);
  }

  @Post('carrito/:carritoId/producto/:productoId')
  async addProductoToCarrito(
    @Param('carritoId', ParseIntPipe) carritoId: number,
    @Param('productoId', ParseIntPipe) productoId: number,
    @Body() body: { cantidad?: number },
  ) {
    return await this.carritoItemService.addProductoToCarrito(
      carritoId,
      productoId,
      body.cantidad || 1,
    );
  }
}

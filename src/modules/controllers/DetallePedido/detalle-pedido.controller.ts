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
import { DetallePedidoService } from './detalle-pedido.service';
import { CreateDetallePedidoDto } from './dto/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from './dto/update-detalle-pedido.dto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';

@Controller('detalle-pedidos')
@UseGuards(JwtAuthGuard)
export class DetallePedidoController {
  constructor(private readonly detallePedidoService: DetallePedidoService) {}

  @Post()
  async create(@Body() createDetallePedidoDto: CreateDetallePedidoDto) {
    return await this.detallePedidoService.create(createDetallePedidoDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('pedido') pedido?: number,
    @Query('producto') producto?: number,
  ) {
    return await this.detallePedidoService.findAll({
      page,
      limit,
      pedido,
      producto,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.detallePedidoService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetallePedidoDto: UpdateDetallePedidoDto,
  ) {
    return await this.detallePedidoService.update(id, updateDetallePedidoDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.detallePedidoService.remove(id);
  }

  @Get('pedido/:pedidoId')
  async findByPedido(@Param('pedidoId', ParseIntPipe) pedidoId: number) {
    return await this.detallePedidoService.findByPedido(pedidoId);
  }
}

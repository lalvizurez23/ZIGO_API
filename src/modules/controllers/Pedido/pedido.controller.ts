import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';
import { GetUser } from '../Auth/decorators/get-user.decorator';
import { Usuario } from '../../../database/entities/usuario.entity';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  async create(@Body() createPedidoDto: CreatePedidoDto, @GetUser() user: Usuario) {
    return await this.pedidoService.create(createPedidoDto, user.idUsuario);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('usuario') usuario?: number,
    @Query('estado') estado?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return await this.pedidoService.findAll({
      page,
      limit,
      usuario,
      estado,
      fechaInicio,
      fechaFin,
    });
  }

  @Get('usuario/:usuarioId')
  async findByUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return await this.pedidoService.findByUsuario(usuarioId);
  }

  @Get('mis-pedidos')
  async findMyPedidos(@GetUser() user: Usuario) {
    return await this.pedidoService.findByUsuario(user.idUsuario);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.pedidoService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePedidoDto: UpdatePedidoDto,
  ) {
    return await this.pedidoService.update(id, updatePedidoDto);
  }

  @Put(':id/estado')
  async updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: string },
  ) {
    return await this.pedidoService.updateEstado(id, body.estado);
  }

  @Post(':id/cancelar')
  async cancelar(@Param('id', ParseIntPipe) id: number) {
    return await this.pedidoService.cancelar(id);
  }

  @Post('desde-carrito/:carritoId')
  async crearDesdeCarrito(
    @Param('carritoId', ParseIntPipe) carritoId: number,
    @Body() body: { metodoPago?: string; direccionEnvio?: string; notas?: string },
    @GetUser() user: Usuario,
  ) {
    return await this.pedidoService.crearDesdeCarrito(
      carritoId,
      user.idUsuario,
      body,
    );
  }

  @Post('checkout')
  async checkout(
    @Body() body: { 
      direccionEnvio: string;
      numeroTarjeta: string;
      nombreTarjeta: string;
      fechaExpiracion: string;
      cvv: string;
    },
    @GetUser() user: Usuario,
  ) {
    return await this.pedidoService.checkout(user.idUsuario, body);
  }
}

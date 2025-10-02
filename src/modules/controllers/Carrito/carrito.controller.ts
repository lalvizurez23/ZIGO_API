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
import { CarritoService } from './carrito.service';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';
import { GetUser } from '../Auth/decorators/get-user.decorator';
import { Usuario } from '../../../database/entities/usuario.entity';

@Controller('carritos')
@UseGuards(JwtAuthGuard)
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Post()
  async create(@Body() createCarritoDto: CreateCarritoDto, @GetUser() user: Usuario) {
    return await this.carritoService.create(createCarritoDto, user.idUsuario);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('usuario') usuario?: number,
    @Query('activo') activo?: boolean,
  ) {
    return await this.carritoService.findAll({
      page,
      limit,
      usuario,
      activo,
    });
  }

  @Get('usuario/:usuarioId')
  async findByUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return await this.carritoService.findByUsuario(usuarioId);
  }

  @Get('mi-carrito')
  async findMyCarrito(@GetUser() user: Usuario) {
    return await this.carritoService.findByUsuario(user.idUsuario);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.carritoService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCarritoDto: UpdateCarritoDto,
  ) {
    return await this.carritoService.update(id, updateCarritoDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.carritoService.remove(id);
  }

  @Put(':id/activar')
  async activate(@Param('id', ParseIntPipe) id: number) {
    return await this.carritoService.activate(id);
  }

  @Put(':id/desactivar')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return await this.carritoService.deactivate(id);
  }

  @Post(':id/vaciar')
  async vaciar(@Param('id', ParseIntPipe) id: number) {
    return await this.carritoService.vaciar(id);
  }
}

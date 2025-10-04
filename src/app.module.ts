import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './config/data-source';
import { AuthModule } from './modules/controllers/Auth/auth.module';
import { CategoriaModule } from './modules/controllers/Categoria/categoria.module';
import { ProductoModule } from './modules/controllers/Producto/producto.module';
import { CarritoModule } from './modules/controllers/Carrito/carrito.module';
import { PedidoModule } from './modules/controllers/Pedido/pedido.module';
import { DetallePedidoModule } from './modules/controllers/DetallePedido/detalle-pedido.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    CategoriaModule,
    ProductoModule,
    CarritoModule,
    PedidoModule,
    DetallePedidoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


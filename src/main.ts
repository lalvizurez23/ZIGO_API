import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { validateEnvironment } from './config/env.validation';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Validar variables de entorno ANTES de iniciar la aplicación
    validateEnvironment();

    const app = await NestFactory.create(AppModule);
    
    // Configurar CORS
    app.enableCors();
    
    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    logger.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
    logger.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`💾 Base de datos: ${process.env.DB_TYPE}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
  } catch (error) {
    logger.error('❌ Error al iniciar la aplicación:', error.message);
    process.exit(1);
  }
}
bootstrap();


import { Logger } from '@nestjs/common';

/**
 * Valida que las variables de entorno requeridas estén presentes
 * La aplicación NO debe iniciar si faltan variables críticas
 */
export function validateEnvironment(): void {
  const logger = new Logger('EnvironmentValidation');
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_EXPIRATION',
    'DB_TYPE',
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
  ];

  const missingVars: string[] = [];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    logger.error('Faltan variables de entorno requeridas:');
    missingVars.forEach((varName) => {
      logger.error(`   - ${varName}`);
    });
    logger.error('Solución:');
    logger.error('   1. Copia el archivo env-example.txt a .env');
    logger.error('   2. Configura todas las variables requeridas');
    logger.error('   3. Reinicia la aplicación\n');
    
    throw new Error(
      `Faltan variables de entorno requeridas: ${missingVars.join(', ')}`
    );
  }

  logger.log('✅ Variables de entorno validadas correctamente');
}

/**
 * Obtiene una variable de entorno requerida
 * Lanza un error si no existe
 */
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  
  if (!value) {
    throw new Error(
      `Variable de entorno requerida no encontrada: ${key}`
    );
  }
  
  return value;
}

/**
 * Obtiene una variable de entorno opcional con valor por defecto
 * Solo usar para variables NO sensibles
 */
export function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}


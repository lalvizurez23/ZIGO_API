import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private redisClient: RedisClientType;
  private readonly ttl: number;

  constructor(private readonly configService: ConfigService) {
    this.ttl = this.configService.get<number>('REDIS_TTL', 86400); // 24 horas por defecto
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
      const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
      const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
      const redisDb = this.configService.get<number>('REDIS_DB', 0);

      const redisUrl = `redis://${redisHost}:${redisPort}/${redisDb}`;
      
      this.redisClient = createClient({
        url: redisUrl,
        password: redisPassword,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        },
      });

      this.redisClient.on('error', (err) => {
        this.logger.error('Redis Client Error:', err);
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis Client Connected');
      });

      this.redisClient.on('disconnect', () => {
        this.logger.warn('Redis Client Disconnected');
      });

      await this.redisClient.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      throw error;
    }
  }

  /**
   * Agrega un token a la blacklist
   * @param token - Token JWT a agregar a la blacklist
   * @param customTtl - TTL personalizado en segundos (opcional)
   */
  async addToBlacklist(token: string, customTtl?: number): Promise<void> {
    try {
      const ttl = customTtl || this.ttl;
      const key = `blacklist:${token}`;
      
      await this.redisClient.setEx(key, ttl, 'blacklisted');
      this.logger.debug(`Token agregado a blacklist con TTL: ${ttl}s`);
    } catch (error) {
      this.logger.error('Error al agregar token a blacklist:', error);
      throw error;
    }
  }

  /**
   * Verifica si un token está en la blacklist
   * @param token - Token JWT a verificar
   * @returns true si está en blacklist, false si no
   */
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      const key = `blacklist:${token}`;
      const result = await this.redisClient.get(key);
      return result !== null;
    } catch (error) {
      this.logger.error('Error al verificar token en blacklist:', error);
      // En caso de error, asumimos que no está en blacklist para no bloquear usuarios
      return false;
    }
  }

  /**
   * Remueve un token de la blacklist (útil para casos especiales)
   * @param token - Token JWT a remover de la blacklist
   */
  async removeFromBlacklist(token: string): Promise<void> {
    try {
      const key = `blacklist:${token}`;
      await this.redisClient.del(key);
      this.logger.debug('Token removido de blacklist');
    } catch (error) {
      this.logger.error('Error al remover token de blacklist:', error);
      throw error;
    }
  }

  /**
   * Agrega múltiples tokens a la blacklist (útil para logout masivo)
   * @param tokens - Array de tokens JWT
   * @param customTtl - TTL personalizado en segundos (opcional)
   */
  async addMultipleToBlacklist(tokens: string[], customTtl?: number): Promise<void> {
    try {
      const ttl = customTtl || this.ttl;
      const pipeline = this.redisClient.multi();
      
      tokens.forEach(token => {
        const key = `blacklist:${token}`;
        pipeline.setEx(key, ttl, 'blacklisted');
      });
      
      await pipeline.exec();
      this.logger.debug(`${tokens.length} tokens agregados a blacklist`);
    } catch (error) {
      this.logger.error('Error al agregar múltiples tokens a blacklist:', error);
      throw error;
    }
  }

  /**
   * Obtiene información sobre un token en la blacklist
   * @param token - Token JWT
   * @returns Información del token (TTL restante, etc.)
   */
  async getTokenInfo(token: string): Promise<{ isBlacklisted: boolean; ttl?: number }> {
    try {
      const key = `blacklist:${token}`;
      const ttl = await this.redisClient.ttl(key);
      
      if (ttl > 0) {
        return { isBlacklisted: true, ttl };
      } else if (ttl === 0) {
        return { isBlacklisted: false };
      } else {
        return { isBlacklisted: false };
      }
    } catch (error) {
      this.logger.error('Error al obtener información del token:', error);
      return { isBlacklisted: false };
    }
  }

  /**
   * Limpia todos los tokens expirados (Redis lo hace automáticamente, pero útil para debugging)
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      // Redis maneja automáticamente la expiración, pero podemos hacer una limpieza manual si es necesario
      const keys = await this.redisClient.keys('blacklist:*');
      let cleanedCount = 0;
      
      for (const key of keys) {
        const ttl = await this.redisClient.ttl(key);
        if (ttl === -2) { // Key no existe
          cleanedCount++;
        }
      }
      
      this.logger.log(`Limpieza completada. ${cleanedCount} tokens expirados removidos`);
    } catch (error) {
      this.logger.error('Error en limpieza de tokens:', error);
    }
  }

  /**
   * Cierra la conexión con Redis
   */
  async closeConnection(): Promise<void> {
    try {
      await this.redisClient.quit();
      this.logger.log('Conexión Redis cerrada');
    } catch (error) {
      this.logger.error('Error al cerrar conexión Redis:', error);
    }
  }
}

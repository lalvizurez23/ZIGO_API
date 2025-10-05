# Guía de Docker - ZIGO E-Commerce

Esta guía explica cómo ejecutar el proyecto completo usando Docker y Docker Compose.

## Requisitos Previos

- Docker Desktop instalado (versión 20.10 o superior)
- Docker Compose (incluido en Docker Desktop)
- 4GB de RAM disponible mínimo
- Puertos disponibles: 80, 3000, 3306, 6379

## Arquitectura de Contenedores

El proyecto utiliza 4 servicios principales:

1. **mysql**: Base de datos MySQL 8.0
2. **redis**: Cache y manejo de sesiones
3. **backend**: API NestJS
4. **frontend**: Aplicación React con Nginx

## Inicio Rápido

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd zigo-ecommerce
```

### 2. Configurar variables de entorno

Copiar el archivo de ejemplo y ajustar según sea necesario:

```bash
cp env.docker.example .env
```

Variables importantes:
- `DB_PASSWORD`: Contraseña de MySQL (default: root123)
- `JWT_SECRET`: Secreto para JWT (cambiar en producción)
- `BACKEND_PORT`: Puerto del backend (default: 3000)
- `FRONTEND_PORT`: Puerto del frontend (default: 80)

### 3. Construir y levantar los servicios

```bash
# Construir imágenes y levantar servicios
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
```

### 4. Verificar que los servicios estén corriendo

```bash
# Ver estado de los contenedores
docker-compose ps

# Verificar health checks
docker ps
```

Deberías ver todos los servicios con estado "healthy".

### 5. Acceder a la aplicación

- **Frontend**: http://localhost (puerto 80)
- **Backend API**: http://localhost:3000/api
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

## Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose stop

# Reiniciar servicios
docker-compose restart

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes (CUIDADO: elimina datos)
docker-compose down -v
```

### Ver Logs

```bash
# Logs de todos los servicios
docker-compose logs

# Logs en tiempo real
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
docker-compose logs redis
```

### Ejecutar Comandos en Contenedores

```bash
# Acceder al contenedor del backend
docker-compose exec backend sh

# Ejecutar migraciones
docker-compose exec backend npm run migration:run

# Ejecutar seeders
docker-compose exec backend npm run seed

# Acceder a MySQL
docker-compose exec mysql mysql -u zigo_user -p zigo_ecommerce

# Acceder a Redis CLI
docker-compose exec redis redis-cli
```

### Reconstruir Servicios

```bash
# Reconstruir un servicio específico
docker-compose up -d --build backend

# Reconstruir todos los servicios
docker-compose up -d --build

# Forzar reconstrucción sin cache
docker-compose build --no-cache
```

## Estructura de Volúmenes

El proyecto utiliza volúmenes persistentes para:

- `mysql_data`: Datos de MySQL
- `redis_data`: Datos de Redis

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar un volumen
docker volume inspect zigo-ecommerce_mysql_data

# Eliminar volúmenes huérfanos
docker volume prune
```

## Troubleshooting

### Los servicios no inician

```bash
# Ver logs detallados
docker-compose logs

# Verificar que los puertos no estén en uso
netstat -ano | findstr :3000
netstat -ano | findstr :80
netstat -ano | findstr :3306
```

### Backend no se conecta a MySQL

1. Verificar que MySQL esté healthy:
   ```bash
   docker-compose ps mysql
   ```

2. Verificar variables de entorno:
   ```bash
   docker-compose exec backend env | grep DB_
   ```

3. Probar conexión manual:
   ```bash
   docker-compose exec backend sh
   nc -zv mysql 3306
   ```

### Frontend no se conecta al Backend

1. Verificar que el backend esté corriendo:
   ```bash
   curl http://localhost:3000/api
   ```

2. Verificar configuración de VITE_API_URL en el frontend

### Problemas de permisos

Si hay problemas de permisos en Linux/Mac:

```bash
# Dar permisos al directorio
sudo chown -R $USER:$USER .

# Reconstruir con permisos correctos
docker-compose down
docker-compose up -d --build
```

### Limpiar todo y empezar de cero

```bash
# CUIDADO: Esto eliminará todos los datos
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## Desarrollo con Docker

### Hot Reload en Desarrollo

Para desarrollo con hot reload, puedes montar volúmenes:

```yaml
# Agregar en docker-compose.yml bajo el servicio backend:
volumes:
  - ./Backend/src:/app/src
```

### Variables de Entorno para Desarrollo

Crear un archivo `.env.development`:

```bash
NODE_ENV=development
DB_HOST=mysql
DB_PORT=3306
# ... otras variables
```

Y usar:

```bash
docker-compose --env-file .env.development up
```

## Producción

### Consideraciones de Seguridad

1. Cambiar `JWT_SECRET` a un valor seguro
2. Usar contraseñas fuertes para MySQL
3. No exponer puertos innecesarios
4. Usar redes privadas para comunicación entre servicios
5. Implementar SSL/TLS (usar reverse proxy como Traefik o Nginx)

### Optimizaciones

1. Usar multi-stage builds (ya implementado)
2. Minimizar tamaño de imágenes
3. Implementar health checks (ya implementado)
4. Configurar restart policies
5. Limitar recursos (CPU, memoria)

### Deploy en Servidor

```bash
# En el servidor
git clone <repository-url>
cd zigo-ecommerce

# Configurar .env para producción
cp env.docker.example .env
nano .env

# Levantar servicios
docker-compose up -d --build

# Verificar
docker-compose ps
docker-compose logs -f
```

## Monitoreo

### Ver uso de recursos

```bash
# Estadísticas en tiempo real
docker stats

# Uso de disco
docker system df

# Información de un contenedor
docker inspect zigo-backend
```

### Health Checks

Todos los servicios tienen health checks configurados:

```bash
# Ver estado de health
docker ps

# Inspeccionar health check
docker inspect --format='{{json .State.Health}}' zigo-backend | jq
```

## Backup y Restauración

### Backup de MySQL

```bash
# Crear backup
docker-compose exec mysql mysqldump -u zigo_user -p zigo_ecommerce > backup.sql

# Restaurar backup
docker-compose exec -T mysql mysql -u zigo_user -p zigo_ecommerce < backup.sql
```

### Backup de Volúmenes

```bash
# Backup de volumen MySQL
docker run --rm -v zigo-ecommerce_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz /data

# Restaurar
docker run --rm -v zigo-ecommerce_mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql-backup.tar.gz -C /
```

## Soporte

Para más información, consulta:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- README principal del proyecto

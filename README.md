# Backend NestJS - ZIGO E-commerce

Sistema de e-commerce desarrollado con NestJS, TypeORM y MySQL. Implementa autenticación JWT con Redis, gestión de carritos persistentes y procesamiento de pedidos.

## Requisitos Previos

- Node.js >= 20.11
- npm o yarn
- MySQL 8.0+
- Redis (para blacklist de tokens JWT)

## Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Instalar y configurar Redis
```bash
# Con Docker (recomendado)
docker run -d -p 6379:6379 redis:alpine

# Verificar que Redis esté funcionando
docker ps | findstr redis
```

### 3. Configurar variables de entorno
```bash
cp env-example.txt .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Base de datos
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=zigo_ecommerce

# Aplicación
PORT=3000
NODE_ENV=development

# JWT (REQUERIDO)
JWT_SECRET=tu_clave_generada_con_npm_run_generate_keys
JWT_EXPIRATION=10m
JWT_RENEWAL_EXTENSION=10m

# Redis (REQUERIDO)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_TTL=86400
```

**IMPORTANTE:** Las variables `JWT_SECRET`, `JWT_EXPIRATION` y `REDIS_*` son obligatorias. La aplicación no iniciará sin ellas.

## Configuración de Base de Datos

Tienes 2 opciones para inicializar la base de datos:

### Opción A: Script SQL directo (Más rápido)
```bash
mysql -u root -p < database-schema-simple.sql
```
Este script crea automáticamente la base de datos, tablas y datos iniciales.

### Opción B: Migraciones + Seeders (Recomendado para desarrollo)

**Orden de ejecución:**

1. Crear la base de datos manualmente:
```sql
CREATE DATABASE zigo_ecommerce;
```

2. Ejecutar migraciones (crea las tablas):
```bash
npm run migration:run
```

3. Ejecutar seeder (inserta datos iniciales):
```bash
npm run seed
```

**Resultado esperado:**
- 7 tablas creadas (usuario, categoria, producto, carrito, carrito_item, pedido, detalle_pedido)
- 2 usuarios de prueba
- 2 carritos activos (uno por usuario)
- 4 categorías
- 11 productos de ejemplo

**Credenciales de acceso:**
- **Admin:** `admin@ecommerce.com` / `Admin123`
- **Cliente:** `usuario@ejemplo.com` / `Usuario123`

## Ejecutar la Aplicación

### Modo desarrollo
```bash
npm run start:dev
```

### Modo producción
```bash
npm run build
npm run start:prod
```

La aplicación estará disponible en `http://localhost:3000`

## Arquitectura del Sistema

### Carrito Persistente

El sistema implementa un carrito persistente único por usuario:

- **Creación automática:** Se crea un carrito al registrar un usuario
- **Persistencia:** El carrito NO se elimina después de una compra, solo se vacía
- **Unicidad:** Cada usuario tiene UN SOLO carrito activo (esta_activo = 1)
- **Reutilización:** El mismo carrito se usa en todas las sesiones del usuario

### Flujo de Compra

1. **Usuario se registra** → Se crea automáticamente su carrito persistente
2. **Agrega productos** → Los items se agregan al carrito existente
3. **Realiza checkout** → Se crea el pedido y se vacían los items del carrito
4. **Nueva compra** → Reutiliza el mismo carrito (vacío)

### Gestión de Stock

- Validación de stock disponible antes de agregar al carrito
- Decremento automático de stock al confirmar pedido
- Transacciones atómicas para evitar inconsistencias
- Rollback automático si falla alguna operación

### Sistema de Autenticación

- **JWT con renovación automática:** Los tokens se renuevan transparentemente
- **Blacklist en Redis:** Tokens revocados se invalidan inmediatamente
- **Extracción de usuario del token:** No se envía userId desde el frontend
- **Seguridad:** Contraseñas hasheadas con bcrypt (10 rounds)

## Endpoints de la API

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario (crea carrito automáticamente)
- `POST /auth/login` - Iniciar sesión (retorna JWT + datos de usuario)
- `POST /auth/logout` - Cerrar sesión (revoca token actual)
- `POST /auth/logout-all` - Cerrar sesión en todos los dispositivos

### Categorías
- `GET /categorias` - Listar categorías con paginación
- `POST /categorias` - Crear categoría
- `GET /categorias/:id` - Obtener categoría por ID
- `PUT /categorias/:id` - Actualizar categoría
- `DELETE /categorias/:id` - Eliminar categoría

### Productos
- `GET /productos` - Listar productos (filtros: búsqueda, categoría, precio)
- `POST /productos` - Crear producto
- `GET /productos/:id` - Obtener producto por ID
- `PUT /productos/:id` - Actualizar producto
- `PUT /productos/:id/stock` - Actualizar stock
- `DELETE /productos/:id` - Eliminar producto

### Carrito (Usuario autenticado)
- `GET /carrito/mi-carrito` - Obtener carrito del usuario (extrae userId del token)
- `POST /carrito/item` - Agregar producto al carrito
  ```json
  {
    "cartId": 1,
    "productId": 5,
    "quantity": 2
  }
  ```
- `PUT /carrito/item/:itemId` - Actualizar cantidad de item
  ```json
  {
    "quantity": 3
  }
  ```
- `DELETE /carrito/item/:itemId` - Eliminar item del carrito
- `DELETE /carrito/clear` - Vaciar carrito completo

### Pedidos
- `GET /pedidos/mis-pedidos` - Obtener pedidos del usuario autenticado
- `GET /pedidos/:id` - Obtener pedido por ID
- `POST /pedidos/checkout` - Procesar pago y crear pedido
  ```json
  {
    "direccionEnvio": "Zona 10, Guatemala",
    "numeroTarjeta": "4111111111111111",
    "nombreTarjeta": "Juan Perez",
    "fechaExpiracion": "12/25",
    "cvv": "123"
  }
  ```
- `PUT /pedidos/:id/estado` - Actualizar estado del pedido
- `POST /pedidos/:id/cancelar` - Cancelar pedido

**Colección de Postman:** Importa `postman_collection.json` y `postman_environment.json`

## Estructura del Proyecto

```
src/
├── config/
│   ├── data-source.ts           # Configuración TypeORM
│   ├── env.validation.ts        # Validación de variables de entorno
│   └── README.md
├── database/
│   ├── entities/                # Entidades TypeORM
│   │   ├── usuario.entity.ts
│   │   ├── categoria.entity.ts
│   │   ├── producto.entity.ts
│   │   ├── carrito.entity.ts
│   │   ├── carrito-item.entity.ts
│   │   ├── pedido.entity.ts
│   │   └── detalle-pedido.entity.ts
│   ├── migrations/              # Migraciones de BD
│   └── seeders/                 # Datos iniciales
├── modules/
│   └── controllers/
│       ├── Auth/                # Autenticación JWT
│       ├── Carrito/             # Gestión de carritos
│       ├── Categoria/           # Gestión de categorías
│       ├── Producto/            # Gestión de productos
│       ├── Pedido/              # Gestión de pedidos
│       └── DetallePedido/       # Detalles de pedidos
├── app.module.ts                # Módulo principal
└── main.ts                      # Punto de entrada
```

## Migraciones de Base de Datos

### Crear una migración
```bash
npm run typeorm migration:create src/database/migrations/NombreMigracion
```

### Generar migración automática
```bash
npm run migration:generate src/database/migrations/NombreMigracion
```

### Ejecutar migraciones
```bash
npm run migration:run
```

### Revertir última migración
```bash
npm run migration:revert
```

## Validaciones Implementadas

### Carrito
- Stock disponible antes de agregar productos
- Solo productos activos pueden agregarse
- Solo carritos activos pueden modificarse
- Cantidades deben ser mayores a 0
- Usuario debe estar autenticado

### Pedidos
- Validación de stock antes de confirmar
- Cálculo automático de totales
- Generación automática de número de pedido
- Transacciones atómicas (rollback en caso de error)

### Autenticación
- Email válido (formato)
- Contraseñas mínimo 6 caracteres
- Token JWT en cada request protegido
- Validación de blacklist antes de procesar request

## Tecnologías Utilizadas

- **NestJS 11** - Framework backend progresivo
- **TypeORM 0.3** - ORM para TypeScript
- **MySQL 8.0** - Base de datos relacional
- **Redis** - Cache y blacklist de tokens
- **JWT (Passport)** - Autenticación stateless
- **bcrypt** - Hash de contraseñas
- **class-validator** - Validación de DTOs
- **class-transformer** - Transformación de datos

## Sistema de Renovación de Tokens

### Flujo de Renovación Automática

1. **Login inicial** - Se genera token con expiración de 10 minutos
2. **Request a endpoint protegido** - Se valida token y blacklist
3. **Renovación automática** - Si el token expira pronto, se genera uno nuevo
4. **Blacklist del anterior** - El token anterior se invalida en Redis
5. **Headers de respuesta** - Se envía nuevo token en `X-New-Token`

### Validación en Guards

En cada request protegido:
1. Extraer token del header `Authorization`
2. Verificar blacklist en Redis (PRIMERO)
3. Validar JWT (expiración, firma)
4. Validar usuario activo
5. Renovar si es necesario

### Configuración de Redis

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_TTL=86400  # 24 horas
```

**Estructura en Redis:**
```
blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... → "blacklisted" (TTL: 24h)
```

## Notas Importantes

### Seguridad
- JWT_SECRET es obligatorio (no hay valor por defecto)
- Contraseñas hasheadas con bcrypt (10 rounds)
- Validación de variables de entorno al inicio
- No se exponen datos sensibles en respuestas

### Base de Datos
- Migraciones en `src/database/migrations/`
- Entidades en `src/database/entities/`
- Seeders en `src/database/seeders/`
- `synchronize: false` - Usamos migraciones, no sync automática

### Precisión Monetaria
- Todos los precios usan `DECIMAL(18,2)`
- Evita errores de redondeo con FLOAT
- Garantiza precisión en cálculos

### Fechas Automáticas
- `fecha_agregado` en carrito_item: `DEFAULT CURRENT_TIMESTAMP`
- `fecha_pedido` en pedido: `DEFAULT CURRENT_TIMESTAMP`
- Ambas son `NOT NULL` para integridad de datos

## Flujo de Trabajo Completo

```bash
# 1. Instalar dependencias
npm install

# 2. Instalar Redis
docker run -d -p 6379:6379 redis:alpine

# 3. Generar JWT Secret
npm run generate:keys

# 4. Configurar .env
cp env-example.txt .env
# Edita .env con tus valores

# 5. Inicializar base de datos
mysql -u root -p < database-schema-simple.sql
# O usar migraciones:
# npm run migration:run
# npm run seed

# 6. Iniciar aplicación
npm run start:dev

# 7. Probar con Postman
# Importa postman_collection.json
```

## Reiniciar Base de Datos

Si necesitas reiniciar desde cero:

```bash
# Revertir todas las migraciones
npm run migration:revert

# Volver a ejecutar migraciones
npm run migration:run

# Volver a insertar datos
npm run seed
```

## Soporte

Para más información sobre endpoints específicos, consulta:
- `ENDPOINTS-AUTH.md` - Documentación de autenticación
- `postman_collection.json` - Colección completa de Postman
- `database-schema-simple.sql` - Schema de base de datos

## Licencia

Proyecto de prueba técnica - ZIGO 2025
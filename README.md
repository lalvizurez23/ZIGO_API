# Backend NestJS con TypeORM

Backend desarrollado con NestJS y TypeORM para gestión de base de datos.

## Requisitos Previos

- Node.js >= 20.11
- npm o yarn
- MySQL o PostgreSQL
- Redis (para blacklist de tokens)

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Instalar y configurar Redis:
```bash
# Con Docker (recomendado)
docker run -d -p 6379:6379 redis:alpine

# Verificar que Redis esté funcionando
docker ps | findstr redis
```

3. Crear archivo `.env` basado en `env-example.txt`:
```bash
cp env-example.txt .env
```

4. Configurar las variables de entorno en el archivo `.env`:
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

# JWT (REQUERIDO - La app NO inicia sin estas)
JWT_SECRET=tu_clave_generada_con_npm_run_generate_keys
JWT_EXPIRATION=10m
JWT_RENEWAL_EXTENSION=10m

# Redis (REQUERIDO - Para blacklist de tokens)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_TTL=86400
```

**CRÍTICO:** `JWT_SECRET`, `JWT_EXPIRATION` y las variables de `REDIS` son **REQUERIDAS**. La aplicación no iniciará sin ellas por seguridad.

## Configuración de Base de Datos

Tienes **2 opciones** para inicializar la base de datos:

### Opción A: Usar SQL directo (Más rápido)
1. Crea la base de datos y ejecuta el script completo:
```bash
mysql -u root -p < database-schema-simple.sql
```
Este script crea la base de datos, tablas y datos iniciales automáticamente.

### Opción B: Usar Migraciones + Seeders (Recomendado para desarrollo)

**Orden de ejecución correcto:**

Después de instalar las dependencias y configurar el `.env`, sigue estos pasos **en orden**:

### 1. Crear la base de datos
Crea manualmente la base de datos en MySQL/PostgreSQL:
```sql
CREATE DATABASE nombre_base_datos;
```

### 2. Ejecutar las migraciones
Las migraciones crean todas las tablas en la base de datos:
```bash
npm run migration:run
```

### 3. Ejecutar el seeder
El seeder inserta los datos iniciales (roles, permisos, usuarios de prueba):
```bash
npm run seed
```

**Resultado esperado:**
- 7 tablas creadas (usuario, categoria, producto, carrito, carrito_item, pedido, detalle_pedido)
- 2 usuarios creados
- 4 categorías creadas
- 10 productos de ejemplo

**Credenciales de acceso:**
- **Admin:** `admin@ecommerce.com` / Password: `Admin123`
- **Cliente:** `usuario@ejemplo.com` / Password: `Usuario123`

---

## Ejecutar la aplicación

### Modo desarrollo
```bash
npm run start:dev
```

### Modo producción
```bash
npm run build
npm run start:prod
```

## Migraciones de Base de Datos

### Crear una migración
```bash
npm run typeorm migration:create src/database/migrations/NombreMigracion
```

### Generar migración automáticamente (basada en cambios en entidades)
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

## Seeders - Datos Iniciales

El seeder se ejecuta **después** de las migraciones para insertar datos iniciales.

```bash
npm run seed
```

**IMPORTANTE:** Debes ejecutar `npm run migration:run` primero para crear las tablas antes de ejecutar el seeder.

## Estructura del Proyecto

```
src/
├── config/
│   ├── data-source.ts        # Configuración TypeORM
│   ├── env.validation.ts     # Validación de variables de entorno
│   └── README.md
├── database/
│   ├── entities/             # Entidades de TypeORM (sin index.ts)
│   ├── migrations/           # Migraciones de base de datos
│   └── seeders/              # Datos iniciales
├── modules/
│   └── controllers/
│       └── Auth/             # Módulo de autenticación
│           ├── dto/          # DTOs de validación
│           ├── guards/       # Guards JWT
│           ├── strategies/   # Estrategias Passport
│           ├── decorators/   # Decoradores personalizados
│           ├── auth.controller.ts
│           ├── auth.service.ts
│           └── auth.module.ts
├── app.module.ts             # Módulo principal
└── main.ts                   # Punto de entrada
```

**Nota:** No usamos archivos `index.ts` - todas las importaciones son directas para mejor control.

## 🔗 Endpoints

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión (retorna JWT + perfil)
- `POST /auth/logout` - Cerrar sesión (revoca token actual)
- `POST /auth/logout-all` - Cerrar sesión en todos los dispositivos
- **🔄 Refresh automático** - Todos los endpoints protegidos renuevan tokens automáticamente

### Categorías
- `GET /categorias` - Listar categorías con paginación y filtros
- `POST /categorias` - Crear categoría
- `GET /categorias/:id` - Obtener categoría por ID
- `PUT /categorias/:id` - Actualizar categoría
- `PUT /categorias/:id/activar` - Activar categoría
- `PUT /categorias/:id/desactivar` - Desactivar categoría
- `DELETE /categorias/:id` - Eliminar categoría

### Productos
- `GET /productos` - Listar productos con filtros avanzados (búsqueda, categoría, precio)
- `POST /productos` - Crear producto
- `GET /productos/:id` - Obtener producto por ID
- `PUT /productos/:id` - Actualizar producto
- `PUT /productos/:id/stock` - Actualizar stock del producto
- `PUT /productos/:id/activar` - Activar producto
- `PUT /productos/:id/desactivar` - Desactivar producto
- `DELETE /productos/:id` - Eliminar producto

### Carritos (Nuevos Endpoints Simplificados)
- `GET /carritos/mi-carrito` - Obtener carrito del usuario autenticado
- `POST /carritos/item` - Agregar producto al carrito (crea carrito si no existe)
- `PUT /carritos/item/:itemId` - Actualizar cantidad de item en el carrito
- `DELETE /carritos/item/:itemId` - Eliminar item del carrito
- `DELETE /carritos/clear` - Vaciar carrito completo del usuario

### Carritos (Endpoints Administrativos)
- `GET /carritos` - Listar todos los carritos con paginación
- `POST /carritos` - Crear carrito manualmente
- `GET /carritos/:id` - Obtener carrito por ID
- `PUT /carritos/:id/activar` - Activar carrito
- `PUT /carritos/:id/desactivar` - Desactivar carrito
- `POST /carritos/:id/vaciar` - Vaciar carrito por ID
- `DELETE /carritos/:id` - Eliminar carrito

### Carrito Items (Endpoints Legacy)
- `GET /carrito-items` - Listar items del carrito con paginación
- `POST /carrito-items` - Crear item del carrito
- `GET /carrito-items/:id` - Obtener item por ID
- `PUT /carrito-items/:id` - Actualizar item del carrito
- `PUT /carrito-items/:id/cantidad` - Actualizar cantidad del item
- `DELETE /carrito-items/:id` - Eliminar item del carrito
- `DELETE /carrito-items/clear` - Vaciar todos los items de todos los carritos

### Pedidos
- `GET /pedidos` - Listar pedidos con filtros avanzados
- `POST /pedidos` - Crear pedido manualmente
- `POST /pedidos/desde-carrito/:carritoId` - Crear pedido desde carrito (recomendado)
- `GET /pedidos/mis-pedidos` - Obtener pedidos del usuario autenticado
- `GET /pedidos/:id` - Obtener pedido por ID
- `PUT /pedidos/:id/estado` - Actualizar estado del pedido
- `POST /pedidos/:id/cancelar` - Cancelar pedido
- `PUT /pedidos/:id` - Actualizar pedido

### Generales
- `GET /` - Mensaje de bienvenida

**Colección de Postman:** Importa `postman_collection.json` y `postman_environment.json` para probar todos los endpoints.

## 🛒 Funcionalidad del Carrito

### Características Principales

- **Creación Automática**: El carrito se crea automáticamente cuando el usuario agrega su primer producto
- **Gestión Simplificada**: Endpoints simplificados que manejan automáticamente la lógica del carrito
- **Validación de Stock**: Verificación automática de stock disponible antes de agregar productos
- **Actualización de Cantidades**: Suma automática si el producto ya existe en el carrito
- **Cálculo de Totales**: Cálculo automático del total del carrito

### Flujo de Trabajo del Carrito

1. **Agregar Producto**: `POST /carritos/item`
   ```json
   {
     "productId": 1,
     "quantity": 2
   }
   ```
   - Crea carrito si no existe
   - Valida stock disponible
   - Suma cantidad si producto ya existe

2. **Ver Carrito**: `GET /carritos/mi-carrito`
   - Retorna carrito completo con items y productos relacionados
   - Incluye cálculo automático de totales

3. **Actualizar Cantidad**: `PUT /carritos/item/:itemId`
   ```json
   {
     "quantity": 5
   }
   ```
   - Valida stock disponible
   - Actualiza cantidad del item específico

4. **Eliminar Item**: `DELETE /carritos/item/:itemId`
   - Elimina item específico del carrito

5. **Vaciar Carrito**: `DELETE /carritos/clear`
   - Elimina todos los items del carrito del usuario

### Validaciones Implementadas

- ✅ **Stock Disponible**: No permite agregar más cantidad de la disponible
- ✅ **Productos Activos**: Solo permite agregar productos activos
- ✅ **Carrito Activo**: Solo permite modificar carritos activos
- ✅ **Cantidades Válidas**: Cantidad debe ser mayor a 0
- ✅ **Usuario Autenticado**: Todos los endpoints requieren autenticación

### Estructura de Respuesta del Carrito

```json
{
  "idCarrito": 1,
  "idUsuario": 2,
  "estaActivo": true,
  "fechaCreacion": "2024-01-15T10:30:00Z",
  "fechaActualizacion": "2024-01-15T11:45:00Z",
  "items": [
    {
      "idCarritoItem": 1,
      "idCarrito": 1,
      "idProducto": 1,
      "cantidad": 2,
      "fechaAgregado": "2024-01-15T10:30:00Z",
      "producto": {
        "idProducto": 1,
        "nombre": "Laptop HP 15-dy2021la",
        "descripcion": "Laptop HP con procesador Intel Core i5",
        "precio": 3500.00,
        "stock": 15,
        "imagenUrl": "https://via.placeholder.com/400x300?text=Laptop+HP",
        "estaActivo": true
      }
    }
  ]
}
```

## Tecnologías

- **NestJS 11** - Framework backend
- **TypeORM 0.3** - ORM para bases de datos
- **TypeScript 5** - Lenguaje de programación
- **MySQL** - Base de datos principal
- **Redis** - Cache y blacklist de tokens
- **JWT (Passport)** - Autenticación con renovación automática
- **bcrypt** - Encriptación de contraseñas
- **class-validator** - Validación de DTOs

## Sistema de Autenticación con Redis

### Lógica de Tokens Renovados y Blacklist

El sistema implementa un mecanismo inteligente de renovación de tokens que **NO almacena tokens expirados** en la base de datos, utilizando Redis para una gestión eficiente de la blacklist.

#### Flujo de Renovación Automática de Tokens

1. **Login Inicial**
   ```json
   POST /auth/login
   {
     "email": "usuario@ejemplo.com",
     "password": "password123"
   }
   
   // Respuesta:
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Mismo token
     "expiresIn": 600, // 10 minutos (configurable)
     "user": { ... }
   }
   ```

2. **Renovación Automática** (Transparente para el Frontend)
   ```json
   GET /api/categorias
   Authorization: Bearer token_actual
   
   // Respuesta con headers automáticos:
   X-New-Token: nuevo_token_con_10m_mas
   X-Token-Refreshed: true
   {
     "data": [...], // Datos normales del endpoint
     "pagination": {...}
   }
   ```

#### **⚡ Proceso Interno de Renovación Automática**

Cuando el frontend hace cualquier request a un endpoint protegido:

1. **✅ Validación de Token**: Se verifica blacklist y validez del JWT
2. **⏰ Verificación de Expiración**: Si el token expira en menos de 2 minutos
3. **🔄 Renovación Automática**: Se genera un nuevo token con tiempo extendido
4. **🚫 Blacklist del Token Anterior**: El token actual se agrega a Redis blacklist
5. **📤 Headers de Respuesta**: Se envía el nuevo token en `X-New-Token`
6. **✅ Transparente**: El frontend recibe datos + nuevo token automáticamente

#### **🛡️ Validación en Guards (Primer Paso)**

En cada request protegido, el `JwtAuthGuard` ejecuta **como primer paso**:

```typescript
// 1. Extraer token del header Authorization
const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

// 2. VERIFICAR BLACKLIST PRIMERO (antes que nada)
const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(token);
if (isBlacklisted) {
  throw new UnauthorizedException('Token ha sido revocado');
}

// 3. Validar JWT (expiración, firma, etc.)
// 4. Validar usuario activo
```

#### **🗄️ Gestión de Redis**

**Variables de entorno requeridas:**
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_TTL=86400

# JWT Configuration
JWT_EXPIRATION=10m
JWT_RENEWAL_EXTENSION=10m
```

**Estructura en Redis:**
```
blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... → "blacklisted" (TTL: 24h)
```

#### Beneficios del Sistema

1. **No Almacena Tokens Expirados**: Redis elimina automáticamente tokens expirados
2. **Renovación Inteligente**: Solo extiende tiempo, no genera tokens innecesarios
3. **Blacklist Inmediata**: Tokens anteriores se invalidan al renovar
4. **Validación Prioritaria**: Blacklist se verifica ANTES que la validación JWT
5. **Escalabilidad**: Redis es mucho más rápido que consultas a BD
6. **Configuración Flexible**: Tiempos parametrizables en `.env`

#### Flujo Recomendado para el Cliente

```javascript
// 1. Login inicial
const { accessToken, expiresIn } = await login();

// 2. Interceptor para manejar refresh automático
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// 3. Interceptor de respuesta para capturar nuevos tokens
apiClient.interceptors.response.use(
  (response) => {
    // Si el servidor envió un nuevo token, actualizarlo
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('access_token', newToken);
      // Actualizar header para futuras requests
      apiClient.defaults.headers['Authorization'] = `Bearer ${newToken}`;
      console.log('Token renovado automáticamente');
    }
    return response;
  },
  (error) => {
    // Solo manejar errores 401 si el token no se pudo renovar
    if (error.response?.status === 401) {
      // Redirigir al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 4. Usar normalmente - el refresh es transparente
const categorias = await apiClient.get('/categorias');
const productos = await apiClient.get('/productos');

// 5. Logout
await apiClient.post('/auth/logout', { refreshToken: accessToken });
```

#### Configuración de Redis

**Instalación con Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Verificar funcionamiento:**
```bash
docker ps | findstr redis
```

## Notas Importantes

### Seguridad
- **JWT_SECRET es requerido** - La app falla si no está configurado (no usa valores por defecto)
- Contraseñas hasheadas con bcrypt (10 rounds)
- Validación de variables de entorno en el inicio
- No se exponen datos sensibles en las respuestas (password, IDs internos)

### Base de Datos
- Las migraciones se encuentran en `src/database/migrations/`
- Las entidades se definen en `src/database/entities/` (sin `index.ts`)
- Los seeders se encuentran en `src/database/seeders/`
- `synchronize: false` - Usamos migraciones, no sincronización automática

### Estructura
- No usamos archivos `index.ts` intermedios
- Importaciones directas para mejor control y debugging

## Flujo de Trabajo Completo

```bash
# 1. Instalar dependencias
npm install

# 2. Instalar Redis
docker run -d -p 6379:6379 redis:alpine

# 3. Generar JWT Secret
npm run generate:keys

# 4. Configurar .env con todas las variables (incluyendo JWT_SECRET y REDIS)
cp env-example.txt .env
# Edita .env con tus valores

# 5. Opción A: Ejecutar script SQL directo
mysql -u root -p < database-schema-simple.sql

# 5. Opción B: Usar migraciones
#    - Crear la base de datos manualmente en MySQL
#    - npm run migration:run
#    - npm run seed

# 6. Iniciar la aplicación
npm run start:dev

# 7. Probar con Postman
# Importa postman_collection.json y postman_environment.json
```

## 🗑️ Reiniciar Base de Datos

Si necesitas reiniciar todo desde cero:

```bash
# Revertir todas las migraciones (elimina todas las tablas)
npm run migration:revert

# Volver a ejecutar migraciones
npm run migration:run

# Volver a insertar datos
npm run seed
```


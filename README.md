# Backend NestJS con TypeORM

Backend desarrollado con NestJS y TypeORM para gestión de base de datos.

## 📋 Requisitos Previos

- Node.js >= 20.11
- npm o yarn
- MySQL o PostgreSQL
- Redis (para blacklist de tokens)

## 🚀 Instalación

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

**⚠️ CRÍTICO:** `JWT_SECRET`, `JWT_EXPIRATION` y las variables de `REDIS` son **REQUERIDAS**. La aplicación no iniciará sin ellas por seguridad.

## ⚙️ Configuración de Base de Datos

Tienes **2 opciones** para inicializar la base de datos:

### Opción A: Usar SQL directo (Más rápido)
1. Crea la base de datos y ejecuta el script completo:
```bash
mysql -u root -p < database-schema-simple.sql
```
Este script crea la base de datos, tablas y datos iniciales automáticamente.

### Opción B: Usar Migraciones + Seeders (Recomendado para desarrollo)

**⚠️ Orden de ejecución correcto:**

Después de instalar las dependencias y configurar el `.env`, sigue estos pasos **en orden**:

### 1️⃣ Crear la base de datos
Crea manualmente la base de datos en MySQL/PostgreSQL:
```sql
CREATE DATABASE nombre_base_datos;
```

### 2️⃣ Ejecutar las migraciones
Las migraciones crean todas las tablas en la base de datos:
```bash
npm run migration:run
```

### 3️⃣ Ejecutar el seeder
El seeder inserta los datos iniciales (roles, permisos, usuarios de prueba):
```bash
npm run seed
```

**📊 Resultado esperado:**
- ✅ 7 tablas creadas (usuario, categoria, producto, carrito, carrito_item, pedido, detalle_pedido)
- ✅ 2 usuarios creados
- ✅ 4 categorías creadas
- ✅ 10 productos de ejemplo

**🔑 Credenciales de acceso:**
- 👨‍💼 **Admin:** `admin@ecommerce.com` / Password: `Admin123`
- 👤 **Cliente:** `usuario@ejemplo.com` / Password: `Usuario123`

---

## 🏃‍♂️ Ejecutar la aplicación

### Modo desarrollo
```bash
npm run start:dev
```

### Modo producción
```bash
npm run build
npm run start:prod
```

## 🗄️ Migraciones de Base de Datos

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

## 🌱 Seeders - Datos Iniciales

El seeder se ejecuta **después** de las migraciones para insertar datos iniciales.

```bash
npm run seed
```

**⚠️ IMPORTANTE:** Debes ejecutar `npm run migration:run` primero para crear las tablas antes de ejecutar el seeder.

## 📁 Estructura del Proyecto

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

### E-commerce
- `GET /categorias` - Listar categorías
- `POST /categorias` - Crear categoría
- `GET /productos` - Listar productos
- `POST /productos` - Crear producto
- `GET /carritos` - Listar carritos
- `POST /carritos` - Crear carrito
- `GET /pedidos` - Listar pedidos
- `POST /pedidos` - Crear pedido

### Generales
- `GET /` - Mensaje de bienvenida

**📮 Colección de Postman:** Importa `postman_collection.json` y `postman_environment.json` para probar todos los endpoints.

## 🛠️ Tecnologías

- **NestJS 11** - Framework backend
- **TypeORM 0.3** - ORM para bases de datos
- **TypeScript 5** - Lenguaje de programación
- **MySQL** - Base de datos principal
- **Redis** - Cache y blacklist de tokens
- **JWT (Passport)** - Autenticación con renovación automática
- **bcrypt** - Encriptación de contraseñas
- **class-validator** - Validación de DTOs

## 🔐 Sistema de Autenticación con Redis

### 🎯 **Lógica de Tokens Renovados y Blacklist**

El sistema implementa un mecanismo inteligente de renovación de tokens que **NO almacena tokens expirados** en la base de datos, utilizando Redis para una gestión eficiente de la blacklist.

#### **🔄 Flujo de Renovación Automática de Tokens**

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

#### **🎯 Beneficios del Sistema**

1. **✅ No Almacena Tokens Expirados**: Redis elimina automáticamente tokens expirados
2. **✅ Renovación Inteligente**: Solo extiende tiempo, no genera tokens innecesarios
3. **✅ Blacklist Inmediata**: Tokens anteriores se invalidan al renovar
4. **✅ Validación Prioritaria**: Blacklist se verifica ANTES que la validación JWT
5. **✅ Escalabilidad**: Redis es mucho más rápido que consultas a BD
6. **✅ Configuración Flexible**: Tiempos parametrizables en `.env`

#### **📱 Flujo Recomendado para el Cliente**

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
      console.log('✅ Token renovado automáticamente');
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

#### **🔧 Configuración de Redis**

**Instalación con Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Verificar funcionamiento:**
```bash
docker ps | findstr redis
```

## 📝 Notas Importantes

### Seguridad
- ✅ **JWT_SECRET es requerido** - La app falla si no está configurado (no usa valores por defecto)
- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Validación de variables de entorno en el inicio
- ✅ No se exponen datos sensibles en las respuestas (password, IDs internos)

### Base de Datos
- Las migraciones se encuentran en `src/database/migrations/`
- Las entidades se definen en `src/database/entities/` (sin `index.ts`)
- Los seeders se encuentran en `src/database/seeders/`
- `synchronize: false` - Usamos migraciones, no sincronización automática

### Estructura
- No usamos archivos `index.ts` intermedios
- Importaciones directas para mejor control y debugging

## 🔄 Flujo de Trabajo Completo

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


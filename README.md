# ZIGO E-Commerce - Prueba Técnica Fullstack

Sistema completo de e-commerce desarrollado con **NestJS** (Backend) y **React + TypeScript** (Frontend). Implementa autenticación JWT, gestión de carritos persistentes, procesamiento de pedidos y pasarela de pago simulada.

## Características Principales

### Backend (NestJS)
- Autenticación JWT con refresh tokens y blacklist en Redis
- Gestión de carritos persistentes (un carrito por usuario)
- Sistema de pedidos con transacciones atómicas
- Validación de stock en tiempo real
- Migraciones y seeders con TypeORM
- Pruebas unitarias con Jest
- Dockerizado con multi-stage builds

### Frontend (React + TypeScript)
- TanStack Query para fetching y cache de datos
- TanStack Form con validación Zod
- Redux Toolkit para estado global
- Material UI + Tailwind CSS
- Protección de rutas con JWT
- Toast notifications animadas
- Accesibilidad completa (ARIA)
- Dockerizado con Nginx

## Tecnologías Utilizadas

### Backend
- NestJS 11
- TypeORM 0.3
- MySQL 8.0
- Redis 7
- JWT + Passport
- Jest (Testing)
- Docker

### Frontend
- React 18
- TypeScript 5
- TanStack Query v5
- TanStack Form
- Redux Toolkit
- Zod (Validación)
- Material UI
- Tailwind CSS
- Vite
- Docker + Nginx

## Inicio Rápido

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd zigo-ecommerce

# 2. Configurar variables de entorno
cp env.docker.example .env

# 3. Levantar todos los servicios
docker-compose up -d --build

# 4. Ver logs
docker-compose logs -f

# 5. Acceder a la aplicación
# Frontend: http://localhost
# Backend: http://localhost:3000/api
```

Ver [DOCKER-README.md](./DOCKER-README.md) para más detalles.

### Opción 2: Instalación Manual

#### Backend

```bash
cd Backend

# Instalar dependencias
npm install

# Configurar .env
cp env-example.txt .env

# Iniciar Redis
docker run -d -p 6379:6379 redis:alpine

# Inicializar base de datos
mysql -u root -p < database-schema-simple.sql

# Ejecutar migraciones y seeders
npm run migration:run
npm run seed

# Iniciar servidor
npm run start:dev
```

#### Frontend

```bash
cd Frontend/zigo-frontend

# Instalar dependencias
npm install

# Configurar .env
cp env.example .env

# Iniciar aplicación
npm run dev
```

## Estructura del Proyecto

```
zigo-ecommerce/
├── Backend/                    # API NestJS
│   ├── src/
│   │   ├── config/            # Configuración (DB, JWT, Redis)
│   │   ├── database/          # Entidades, migraciones, seeders
│   │   ├── modules/           # Módulos (Auth, Carrito, Pedido, etc.)
│   │   └── main.ts
│   ├── test/                  # Pruebas unitarias (Jest)
│   │   └── services/          # Tests de servicios
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── Frontend/zigo-frontend/    # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── contexts/          # Context API (Auth)
│   │   ├── hooks/             # Custom hooks (TanStack Query)
│   │   ├── pages/             # Páginas (Login, Products, Cart, etc.)
│   │   ├── services/          # API services
│   │   ├── store/             # Redux (Auth state)
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utilidades (toast, jwt)
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── README.md
│
├── docker-compose.yml         # Orquestación de servicios
├── DOCKER-README.md           # Guía completa de Docker
├── env.docker.example         # Variables de entorno para Docker
└── README.md                  # Este archivo
```

## Funcionalidades Implementadas

### Autenticación
- [x] Registro de usuarios con validación
- [x] Login con JWT
- [x] Logout con blacklist de tokens
- [x] Protección de rutas
- [x] Refresh tokens
- [x] Redirección automática al expirar token

### Catálogo de Productos
- [x] Listado de productos con imágenes
- [x] Filtrado por categorías
- [x] Visualización de stock disponible
- [x] Agregar al carrito

### Carrito de Compras
- [x] Carrito persistente por usuario
- [x] Agregar productos
- [x] Modificar cantidades
- [x] Eliminar productos
- [x] Vaciar carrito
- [x] Cálculo automático de totales
- [x] Validación de stock en tiempo real

### Checkout y Pagos
- [x] Formulario de pago con TanStack Form
- [x] Validación de tarjeta de crédito (simulada)
- [x] Validación de fecha de expiración
- [x] Procesamiento de pedido con transacciones
- [x] Actualización automática de stock
- [x] Vaciado de carrito post-compra
- [x] Generación de número de pedido único

### Historial de Pedidos
- [x] Listado de pedidos del usuario
- [x] Detalles de cada pedido
- [x] Estados de pedido
- [x] Información de productos comprados

### Experiencia de Usuario
- [x] Notificaciones toast animadas
- [x] Loading states
- [x] Manejo de errores
- [x] Accesibilidad (ARIA)
- [x] Responsive design
- [x] Validación en tiempo real

## Pruebas Unitarias

### Estructura de Tests

Todos los archivos de prueba están centralizados en la carpeta `test/` para mejor organización:

```
Backend/
├── test/
│   └── services/
│       ├── auth.service.spec.ts       # 6 tests
│       ├── carrito.service.spec.ts    # 10 tests
│       └── pedido.service.spec.ts     # 8 tests
└── src/
    └── modules/
        └── controllers/
```

### Ejecutar Pruebas

```bash
cd Backend

# Ejecutar todas las pruebas
npm test

# Ejecutar con cobertura
npm run test:cov

# Modo watch (desarrollo)
npm run test:watch

# Debug de tests
npm run test:debug
```

### Cobertura de Pruebas (24 tests)

#### AuthService (6 tests) ✅
- ✓ Registro exitoso de usuario con hash de contraseña
- ✓ Creación automática de carrito al registrar
- ✓ Excepción si email ya existe (ConflictException)
- ✓ Login exitoso con credenciales válidas
- ✓ Excepción si usuario no existe (UnauthorizedException)
- ✓ Excepción si contraseña incorrecta (UnauthorizedException)
- ✓ Excepción si usuario está inactivo (UnauthorizedException)

#### CarritoService (10 tests) ✅
**findByUsuario:**
- ✓ Retorna carrito activo del usuario
- ✓ Retorna null si no existe carrito activo

**addItemToCart:**
- ✓ Agrega nuevo item al carrito
- ✓ Actualiza cantidad si item ya existe
- ✓ Excepción si producto no existe (BadRequestException)
- ✓ Excepción si no hay stock suficiente (BadRequestException)

**removeItemFromCart:**
- ✓ Elimina item del carrito correctamente
- ✓ Excepción si item no existe (NotFoundException)

**clearUserCart:**
- ✓ Vacía el carrito del usuario
- ✓ Excepción si no existe carrito activo (NotFoundException)

#### PedidoService (8 tests) ✅
**checkout:**
- ✓ Procesa checkout exitosamente con transacción
- ✓ Excepción si carrito está vacío (BadRequestException)
- ✓ Excepción si no hay stock suficiente (BadRequestException)
- ✓ Rollback automático en caso de error

**findByUsuario:**
- ✓ Retorna pedidos del usuario ordenados por fecha
- ✓ Retorna array vacío si no hay pedidos

**findOne:**
- ✓ Retorna pedido por ID con detalles
- ✓ Excepción si pedido no existe (NotFoundException)

### Configuración de Jest

El proyecto usa Jest con ts-jest para ejecutar pruebas TypeScript:

```json
{
  "rootDir": ".",
  "testRegex": ".*\\.spec\\.ts$",
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/src/$1"
  }
}
```

### Mocks y Testing Utilities

Los tests utilizan:
- **@nestjs/testing**: TestingModule para DI
- **Jest mocks**: Para repositorios y servicios externos
- **bcrypt mocks**: Para simular hash de contraseñas
- **QueryRunner mocks**: Para transacciones de base de datos

### Resultados

```bash
Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        ~7-9s
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Obtener producto

### Carrito
- `GET /api/carrito/mi-carrito` - Obtener carrito del usuario
- `POST /api/carrito/item` - Agregar item
- `PUT /api/carrito/item/:id` - Actualizar cantidad
- `DELETE /api/carrito/item/:id` - Eliminar item
- `DELETE /api/carrito/clear` - Vaciar carrito

### Pedidos
- `POST /api/pedidos/checkout` - Procesar pago
- `GET /api/pedidos/mis-pedidos` - Historial de pedidos
- `GET /api/pedidos/:id` - Detalle de pedido

Ver [Backend/postman_collection.json](./Backend/postman_collection.json) para colección completa.

## Credenciales de Prueba

Después de ejecutar el seeder:

**Admin:**
- Email: `admin@ecommerce.com`
- Password: `Admin123`

**Cliente:**
- Email: `usuario@ejemplo.com`
- Password: `Usuario123`

## Docker

El proyecto incluye configuración completa de Docker:

- **Backend**: Multi-stage build con Node 18 Alpine
- **Frontend**: Build con Nginx optimizado
- **MySQL**: Inicialización automática con schema
- **Redis**: Cache y blacklist de tokens
- **Health Checks**: Monitoreo de servicios
- **Volúmenes persistentes**: Datos de MySQL y Redis

Ver [DOCKER-README.md](./DOCKER-README.md) para guía completa.

## Arquitectura

### Backend
- **Patrón**: Modular con NestJS
- **ORM**: TypeORM con Repository Pattern
- **Autenticación**: JWT con estrategia Passport
- **Cache**: Redis para blacklist de tokens
- **Validación**: Class-validator y DTOs
- **Transacciones**: TypeORM QueryRunner para atomicidad

### Frontend
- **Estado Global**: Redux Toolkit (auth)
- **Server State**: TanStack Query (productos, carrito, pedidos)
- **Formularios**: TanStack Form + Zod
- **Routing**: React Router con protección
- **Estilos**: Material UI + Tailwind CSS
- **Build**: Vite (optimizado)

## Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT con expiración configurable
- Blacklist de tokens en Redis
- Validación de entrada en backend y frontend
- Protección contra SQL injection (TypeORM)
- Headers de seguridad en Nginx
- Variables de entorno para secretos
- CORS configurado

## Performance

- Multi-stage Docker builds (imágenes ligeras)
- Cache de datos con TanStack Query
- Lazy loading de componentes
- Optimización de imágenes
- Compresión gzip en Nginx
- Índices en base de datos
- Connection pooling en TypeORM

## Cumplimiento de Requerimientos

### Backend (22%)
- [x] Implementado con NestJS
- [x] Autenticación JWT completa
- [x] Rutas protegidas
- [x] Manejo centralizado de excepciones
- [x] Logging consistente
- [x] Pruebas unitarias (Jest)
- [x] Script SQL completo

### Frontend (28%)
- [x] React con TypeScript
- [x] Protección de rutas
- [x] TanStack Query (queries y mutations)
- [x] Material UI + Tailwind
- [x] Estructura organizada
- [x] Vistas completas (login, productos, carrito, checkout, pedidos)

### TanStack Form (10%)
- [x] Uso en login y checkout
- [x] Validación sincrónica con Zod
- [x] Integración con esquema de validación
- [x] Manejo de estados (touched/dirty/canSubmit)
- [x] Errores del servidor mapeados
- [x] Accesibilidad (labels, aria-*, errores visibles)
- [x] Feedback visual (loading, success, error)

### Docker (5% - Opcional)
- [x] Dockerfile para backend
- [x] Dockerfile para frontend
- [x] docker-compose.yml completo
- [x] Documentación de Docker

### Documentación (8%)
- [x] README completo
- [x] Instrucciones claras
- [x] .env.example
- [x] Guía de Docker

## Mejoras Futuras

- [ ] Paginación de productos
- [ ] Búsqueda de productos
- [ ] Filtros avanzados
- [ ] Wishlist
- [ ] Comparación de productos
- [ ] Reviews y ratings
- [ ] Integración con pasarela real
- [ ] Notificaciones por email
- [ ] Panel de administración
- [ ] Analytics y reportes

## Soporte

Para más información, consulta:
- [Backend README](./Backend/README.md)
- [Frontend README](./Frontend/zigo-frontend/README.md)
- [Docker README](./DOCKER-README.md)
- [Postman Collection](./Backend/postman_collection.json)

## Autor

Prueba Técnica - ZIGO 2025

## Licencia

MIT
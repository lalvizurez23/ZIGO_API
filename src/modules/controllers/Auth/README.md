# Módulo de Autenticación

Este módulo maneja toda la lógica de autenticación y autorización del sistema usando JWT (JSON Web Tokens) con blacklist en Redis.

## Endpoints Disponibles

### 1. Registro de Usuario
**POST** `/auth/register`

Crea un nuevo usuario en el sistema y automáticamente crea su carrito persistente.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "555-1234",        // opcional
  "direccion": "Calle 123"       // opcional
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "idUsuario": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "555-1234",
    "direccion": "Calle 123",
    "estaActivo": true,
    "fechaCreacion": "2025-10-02T12:00:00.000Z"
  }
}
```

**Proceso automático:**
1. Valida datos del usuario
2. Hashea la contraseña con bcrypt (10 rounds)
3. Crea el usuario en la base de datos
4. Crea automáticamente un carrito activo para el usuario
5. Genera token JWT
6. Retorna token + datos del usuario

**Errores:**
- `409 Conflict`: Email ya registrado
- `400 Bad Request`: Datos de validación incorrectos

---

### 2. Login
**POST** `/auth/login`

Autentica un usuario y devuelve el token JWT junto con el perfil completo.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "idUsuario": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "555-1234",
    "direccion": "Calle 123",
    "estaActivo": true,
    "fechaCreacion": "2025-10-02T12:00:00.000Z"
  }
}
```

**Errores:**
- `401 Unauthorized`: Credenciales inválidas o usuario inactivo
- `400 Bad Request`: Datos de validación incorrectos

---

### 3. Logout
**POST** `/auth/logout`

Cierra la sesión del usuario y revoca el token actual agregándolo a la blacklist de Redis.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

**Proceso:**
1. Extrae el token del header Authorization
2. Agrega el token a la blacklist de Redis
3. El token queda inválido inmediatamente
4. TTL del token en Redis: 24 horas

---

### 4. Logout All
**POST** `/auth/logout-all`

Cierra todas las sesiones del usuario en todos los dispositivos.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Todas las sesiones han sido cerradas"
}
```

---

## Protección de Rutas

Para proteger rutas que requieren autenticación, usa el `JwtAuthGuard`:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/guards/jwt-auth.guard';
import { GetUser } from '../Auth/decorators/get-user.decorator';
import { Usuario } from '../../../database/entities/usuario.entity';

@Controller('mi-recurso')
export class MiRecursoController {
  
  @Get()
  @UseGuards(JwtAuthGuard)
  getMiRecurso(@GetUser() user: Usuario) {
    // El decorador @GetUser() inyecta el usuario autenticado
    // El userId se extrae del token JWT automáticamente
    return { mensaje: 'Recurso protegido', usuario: user.email };
  }
}
```

---

## Token JWT

### Uso del Token

El token debe enviarse en el header de las peticiones protegidas:

```
Authorization: Bearer <token>
```

### Contenido del Token (Payload)

```json
{
  "userId": 1,
  "email": "usuario@ejemplo.com",
  "iat": 1696262400,
  "exp": 1696263000
}
```

### Configuración

```env
JWT_SECRET=tu_clave_secreta_generada
JWT_EXPIRATION=10m
JWT_RENEWAL_EXTENSION=10m
```

- **Expiración**: 10 minutos (configurable)
- **Renovación**: Automática en cada request
- **Secret**: Obligatorio en `.env`

### Sistema de Blacklist con Redis

**Validación en cada request:**
1. Extraer token del header Authorization
2. Verificar blacklist en Redis (PRIMERO)
3. Si está en blacklist → 401 Unauthorized
4. Si no está → Validar JWT (expiración, firma)
5. Validar usuario activo

**Estructura en Redis:**
```
blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... → "blacklisted" (TTL: 24h)
```

---

## Extracción de Usuario del Token

El sistema extrae automáticamente el `userId` del token JWT en el backend:

**NO hacer esto en el frontend:**
```typescript
// MAL - No enviar userId desde el frontend
const response = await api.get(`/carrito/usuario/${userId}`)
```

**Hacer esto:**
```typescript
// BIEN - El backend extrae userId del token
const response = await api.get('/carrito/mi-carrito')
```

**En el backend:**
```typescript
@Get('mi-carrito')
@UseGuards(JwtAuthGuard)
async findMyCarrito(@GetUser() user: Usuario) {
  // user.idUsuario se extrae automáticamente del token
  return await this.carritoService.findByUsuario(user.idUsuario);
}
```

---

## Estructura del Módulo

```
src/modules/controllers/Auth/
├── dto/
│   ├── register.dto.ts        # DTO para registro
│   ├── login.dto.ts           # DTO para login
│   └── auth-response.dto.ts   # DTO de respuesta
├── guards/
│   └── jwt-auth.guard.ts      # Guard JWT con blacklist
├── strategies/
│   └── jwt.strategy.ts        # Estrategia de validación JWT
├── decorators/
│   └── get-user.decorator.ts  # Decorador para obtener usuario
├── auth.service.ts            # Lógica de negocio
├── auth.controller.ts         # Endpoints
├── auth.module.ts             # Módulo de Auth
└── README.md                  # Esta documentación

NOTA: Sin archivos index.ts - importaciones directas
```

---

## Seguridad Implementada

- Contraseñas hasheadas con bcrypt (10 rounds)
- Validación de datos con class-validator
- Tokens JWT con expiración configurable
- Blacklist de tokens en Redis
- Verificación de usuarios activos
- Extracción segura de userId del token
- Logging de eventos de seguridad
- Manejo de excepciones específicas
- No se exponen datos sensibles (password)
- Validación de blacklist ANTES de validar JWT

---

## Flujo de Autenticación

### Registro
```
1. Usuario envía datos de registro
2. Backend valida datos
3. Backend hashea contraseña
4. Backend crea usuario en BD
5. Backend crea carrito activo para el usuario
6. Backend genera token JWT
7. Backend retorna token + datos de usuario
```

### Login
```
1. Usuario envía credenciales
2. Backend valida email y password
3. Backend verifica usuario activo
4. Backend genera token JWT
5. Backend retorna token + datos de usuario
```

### Request Protegido
```
1. Frontend envía request con token en header
2. Backend extrae token
3. Backend verifica blacklist en Redis
4. Backend valida JWT (si no está en blacklist)
5. Backend extrae userId del token
6. Backend valida usuario activo
7. Backend procesa request
8. Backend retorna respuesta
```

### Logout
```
1. Frontend envía request de logout con token
2. Backend extrae token
3. Backend agrega token a blacklist en Redis
4. Token queda inválido inmediatamente
5. Backend retorna confirmación
```

---

## Datos de Prueba

```
ADMIN:
   Email: admin@ecommerce.com
   Password: Admin123

CLIENTE:
   Email: usuario@ejemplo.com
   Password: Usuario123
```

---

## Integración con Otros Módulos

Este módulo es usado por:
- **Carrito**: Protege endpoints y extrae userId del token
- **Pedidos**: Protege endpoints y extrae userId del token
- **Productos**: Algunos endpoints requieren autenticación
- **Categorías**: Endpoints administrativos protegidos

---

## Configuración de Redis

**Variables de entorno requeridas:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_TTL=86400  # 24 horas
```

**Instalación con Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

---

## Notas Importantes

1. **JWT_SECRET es obligatorio**: La aplicación no inicia sin él
2. **Redis es obligatorio**: Para blacklist de tokens
3. **Carrito automático**: Se crea al registrar usuario
4. **userId del token**: Siempre se extrae del token, nunca del frontend
5. **Blacklist primero**: Se verifica antes de validar JWT
6. **TTL en Redis**: Tokens expirados se eliminan automáticamente
# 🔐 Módulo de Autenticación

Este módulo maneja toda la lógica de autenticación y autorización del sistema usando JWT (JSON Web Tokens).

## 📋 Endpoints Disponibles

### 1. Registro de Usuario
**POST** `/auth/register`

Crea un nuevo usuario en el sistema.

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
- `409 Conflict`: Email ya registrado
- `400 Bad Request`: Datos de validación incorrectos

---

### 2. Login (Incluye Perfil)
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

## 🔒 Protección de Rutas

Para proteger rutas que requieren autenticación, usa el `AuthGuard` de Passport:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../controllers/Auth/decorators/get-user.decorator';
import { Usuario } from '../../../database/entities/usuario.entity';

@Controller('mi-recurso')
export class MiRecursoController {
  
  @Get()
  @UseGuards(AuthGuard('jwt'))
  getMiRecurso(@GetUser() user: Usuario) {
    // El decorador @GetUser() inyecta el usuario autenticado
    console.log(user.email);
    return { mensaje: 'Recurso protegido', usuario: user.email };
  }
}
```

---

## 🔑 Token JWT

El token debe enviarse en el header de las peticiones protegidas:

```
Authorization: Bearer <token>
```

**Configuración:**
- **Expiración**: 24 horas (configurable en `.env`)
- **Secret**: Definido en `JWT_SECRET` (archivo `.env`)

---

## 🛠️ Estructura del Módulo

```
src/modules/controllers/Auth/
├── dto/
│   ├── register.dto.ts        # DTO para registro
│   ├── login.dto.ts           # DTO para login
│   └── auth-response.dto.ts   # DTO de respuesta
├── strategies/
│   └── jwt.strategy.ts        # Estrategia de validación JWT
├── decorators/
│   └── get-user.decorator.ts  # Decorador para obtener usuario
├── auth.service.ts            # Lógica de negocio
├── auth.controller.ts         # Endpoints
├── auth.module.ts             # Módulo de Auth
└── README.md                  # Esta documentación

NOTA: Sin archivos index.ts - importaciones directas para mejor control
```

---

## ✅ Seguridad Implementada

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Validación de datos con class-validator
- ✅ Tokens JWT con expiración
- ✅ Verificación de usuarios activos
- ✅ Logging de eventos de seguridad
- ✅ Manejo de excepciones específicas
- ✅ No se exponen datos sensibles (password, id)

---

## 📝 Datos de Prueba

```
👨‍💼 Admin:
   Email: admin@ecommerce.com
   Password: Admin123

👤 Cliente:
   Email: usuario@ejemplo.com
   Password: Usuario123
```

---

## 🔄 Próximos Pasos

Este módulo será usado por:
- Módulo de Carrito (proteger endpoints)
- Módulo de Pedidos (proteger endpoints)
- Módulo de Productos (endpoints públicos y privados)


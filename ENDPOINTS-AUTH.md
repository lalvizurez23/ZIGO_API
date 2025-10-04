# 🚀 Guía de Uso - Endpoints de Autenticación

## ⚙️ Configuración Previa

1. **Crear archivo `.env`**:
   ```bash
   cp env-example.txt .env
   ```

2. **Editar `.env` con tus datos**:
   ```env
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=tu_password
   DB_DATABASE=zigo_ecommerce
   
   PORT=3000
   NODE_ENV=development
   
   JWT_SECRET=mi_clave_secreta_super_segura_2025
   JWT_EXPIRATION=24h
   ```

3. **Ejecutar seeders (opcional)**:
   ```bash
   npm run seed
   ```

4. **Iniciar el servidor**:
   ```bash
   npm run start:dev
   ```

---

## 📡 Endpoints Disponibles

Base URL: `http://localhost:3000`

---

### 1. Registro de Usuario

**POST** `/auth/register`

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@ejemplo.com",
    "password": "Password123",
    "nombre": "María",
    "apellido": "González",
    "telefono": "555-9876",
    "direccion": "Av. Principal 456"
  }'
```

**Ejemplo con Postman/Thunder Client:**
```json
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "nuevo@ejemplo.com",
  "password": "Password123",
  "nombre": "María",
  "apellido": "González",
  "telefono": "555-9876",
  "direccion": "Av. Principal 456"
}
```

**Respuesta Exitosa (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoibnVldm9AZWplbXBsby5jb20iLCJpYXQiOjE3Mjc4ODc2MDAsImV4cCI6MTcyNzk3NDAwMH0.abc123...",
  "user": {
    "email": "nuevo@ejemplo.com",
    "nombre": "María",
    "apellido": "González",
    "telefono": "555-9876",
    "direccion": "Av. Principal 456",
    "estaActivo": true,
    "fechaCreacion": "2025-10-02T15:30:00.000Z"
  }
}
```

**Errores Comunes:**
```json
// Email ya registrado (409)
{
  "statusCode": 409,
  "message": "El email ya está registrado",
  "error": "Conflict"
}

// Validación fallida (400)
{
  "statusCode": 400,
  "message": [
    "El email debe ser válido",
    "La contraseña debe tener al menos 6 caracteres"
  ],
  "error": "Bad Request"
}
```

---

### 2. Login (Incluye Perfil del Usuario)

**POST** `/auth/login`

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "Usuario123"
  }'
```

**Ejemplo con Postman/Thunder Client:**
```json
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "Usuario123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoidXN1YXJpb0BlamVtcGxvLmNvbSIsImlhdCI6MTcyNzg4NzYwMCwiZXhwIjoxNzI3OTc0MDAwfQ.xyz789...",
  "user": {
    "email": "usuario@ejemplo.com",
    "nombre": "Carlos",
    "apellido": "Usuario",
    "telefono": null,
    "direccion": null,
    "estaActivo": true,
    "fechaCreacion": "2025-10-01T10:00:00.000Z"
  }
}
```

**Errores Comunes:**
```json
// Credenciales inválidas (401)
{
  "statusCode": 401,
  "message": "Credenciales inválidas",
  "error": "Unauthorized"
}

// Usuario inactivo (401)
{
  "statusCode": 401,
  "message": "Usuario inactivo",
  "error": "Unauthorized"
}
```

---

## 🔒 Uso del Token en Peticiones Protegidas

Una vez que obtengas el `accessToken`, debes enviarlo en el header de autorización:

**Ejemplo con cURL:**
```bash
curl -X GET http://localhost:3000/carrito \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Ejemplo con Postman:**
```
GET http://localhost:3000/carrito
Authorization: Bearer <tu_token_aquí>
```

**Ejemplo con JavaScript (Fetch):**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

fetch('http://localhost:3000/carrito', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 🧪 Flujo de Prueba Completo

1. **Registrar un nuevo usuario:**
   ```bash
   POST /auth/register
   → Guardar el accessToken
   ```

2. **Hacer login:**
   ```bash
   POST /auth/login
   → Verificar que el perfil se retorne correctamente
   → Guardar el accessToken
   ```

3. **Usar el token en endpoints protegidos** (próximamente):
   ```bash
   GET /carrito
   Authorization: Bearer <token>
   ```

---

## 📋 Usuarios de Prueba (Seeders)

Si ejecutaste `npm run seed`, estos usuarios ya están disponibles:

```
👨‍💼 Admin:
   Email: admin@ecommerce.com
   Password: Admin123

👤 Cliente:
   Email: usuario@ejemplo.com
   Password: Usuario123
```

---

## ✅ Validaciones Implementadas

### Registro
- ✅ Email debe ser válido
- ✅ Contraseña mínimo 6 caracteres
- ✅ Nombre y apellido obligatorios
- ✅ Teléfono y dirección opcionales
- ✅ Email único (no duplicados)

### Login
- ✅ Email debe ser válido
- ✅ Password obligatorio
- ✅ Usuario debe estar activo
- ✅ Contraseña debe coincidir

---

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT con expiración de 24h
- ✅ No se exponen contraseñas ni IDs en las respuestas
- ✅ Logging de eventos de autenticación
- ✅ Validación estricta de datos de entrada

---

## 🐛 Troubleshooting

**Error: Cannot connect to database**
- Verifica que MySQL esté corriendo
- Verifica las credenciales en `.env`
- Crea la base de datos: `CREATE DATABASE zigo_ecommerce;`

**Error: JWT_SECRET is not defined**
- Asegúrate de tener el archivo `.env` en la raíz
- Verifica que `JWT_SECRET` esté definido

**Error: Cannot POST /auth/register**
- Verifica que el servidor esté corriendo en el puerto correcto
- Verifica la URL: `http://localhost:3000/auth/register`

---

## 📚 Próximos Pasos

- [ ] Crear módulo de Productos
- [ ] Crear módulo de Carrito (protegido con JWT)
- [ ] Crear módulo de Pedidos (protegido con JWT)
- [ ] Crear colección de Postman
- [ ] Agregar tests unitarios

---

**Fecha de Actualización:** Jueves 2 de Octubre, 2025


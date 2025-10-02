# 📮 Guía de Importación de Postman

## 🚀 Importar la Colección

### Paso 1: Abrir Postman
1. Abre Postman Desktop o Web
2. Click en **"Import"** (esquina superior izquierda)

### Paso 2: Importar Archivos
Arrastra y suelta estos dos archivos en la ventana de importación:
- ✅ `postman_collection.json` - La colección con todos los endpoints
- ✅ `postman_environment.json` - Las variables de entorno

### Paso 3: Seleccionar el Ambiente
1. En la esquina superior derecha, click en el dropdown de "No Environment"
2. Selecciona **"ZIGO Development"**

---

## 🎯 Endpoints Disponibles

### 📁 Carpeta "Auth"

#### 1. **Register** - POST `/auth/register`
Registra un nuevo usuario.

**Body de ejemplo:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "Password123",
  "nombre": "María",
  "apellido": "González",
  "telefono": "555-9876",
  "direccion": "Av. Principal 456"
}
```

**✨ Script automático:** Guarda el token en la variable `access_token`

---

#### 2. **Login** - POST `/auth/login`
Autentica un usuario existente.

**Body de ejemplo:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Usuario123"
}
```

**✨ Script automático:** Guarda el token en la variable `access_token`

---

#### 3. **Login Admin** - POST `/auth/login`
Login con usuario administrador (seeders).

**Body:**
```json
{
  "email": "admin@ecommerce.com",
  "password": "Admin123"
}
```

---

### 📁 Health Check
Simple endpoint para verificar que el servidor está corriendo.

---

## 🔐 Autenticación Automática

La colección está configurada para usar **Bearer Token automáticamente** en todos los endpoints protegidos.

### ¿Cómo funciona?

1. **Haces login** → El script guarda el token automáticamente
2. **Llamas a endpoints protegidos** → El token se envía automáticamente en el header:
   ```
   Authorization: Bearer {{access_token}}
   ```

### Ver el token guardado
1. Click en el ícono de ojo 👁️ (esquina superior derecha)
2. Verás las variables:
   - `base_url`: http://localhost:3000
   - `access_token`: tu token JWT
   - `user_email`: email del usuario

---

## 🧪 Flujo de Prueba Recomendado

### 1️⃣ Verificar servidor
```
GET Health Check
```
Debe retornar: `"Hello World!"`

---

### 2️⃣ Registrar un nuevo usuario
```
POST Auth > Register
```
- Cambia el email en el body para evitar duplicados
- Verifica que el token se guardó (consola de Postman)

---

### 3️⃣ Hacer login
```
POST Auth > Login
o
POST Auth > Login Admin
```
- El token se guarda automáticamente
- Verifica el perfil del usuario en la respuesta

---

### 4️⃣ Usar endpoints protegidos (próximamente)
Cuando agregues endpoints de Carrito, Pedidos, etc.:
```
GET /carrito
GET /pedidos
POST /carrito/items
```
El token se enviará automáticamente ✅

---

## 📊 Respuestas de Ejemplo

Cada endpoint tiene respuestas de ejemplo guardadas:
- ✅ **Exitosas**: Código 200/201
- ❌ **Errores**: Códigos 400, 401, 409

Para verlas:
1. Click en un endpoint
2. Click en la pestaña **"Examples"** (al lado derecho)

---

## 🛠️ Variables de Entorno

### Editar variables
1. Click en el ícono de ojo 👁️
2. Click en **"Edit"** al lado de "ZIGO Development"
3. Modifica las variables:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `base_url` | URL del backend | `http://localhost:3000` |
| `access_token` | Token JWT (auto) | Se guarda automáticamente |
| `user_email` | Email del usuario (auto) | Se guarda automáticamente |

---

## 🎨 Personalización

### Cambiar puerto del backend
Si tu backend corre en otro puerto:
1. Edita la variable `base_url`
2. Por ejemplo: `http://localhost:5000`

### Agregar más endpoints
Cuando crees nuevos endpoints (Productos, Carrito, etc.):
1. Click derecho en la carpeta "ZIGO E-commerce API"
2. **"Add Request"**
3. Configura el endpoint
4. El token se enviará automáticamente si está protegido

---

## 🐛 Troubleshooting

### ❌ Error: "Could not send request"
- Verifica que el servidor esté corriendo: `npm run start:dev`
- Verifica el puerto en `base_url`

### ❌ Error 401: "Unauthorized"
- El token expiró o no se guardó
- Haz login nuevamente para obtener un token nuevo

### ❌ Error 409: "Email ya registrado"
- Cambia el email en el body del registro
- O elimina el usuario de la base de datos

---

## 📝 Usuarios de Prueba (Seeders)

Si ejecutaste `npm run seed`:

```
👨‍💼 Admin:
   Email: admin@ecommerce.com
   Password: Admin123

👤 Cliente:
   Email: usuario@ejemplo.com
   Password: Usuario123
```

---

## 🎯 Scripts Automáticos

Los endpoints incluyen scripts que se ejecutan automáticamente:

### Script de Login/Register
```javascript
// Guardar el token automáticamente
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set('access_token', jsonData.accessToken);
    pm.environment.set('user_email', jsonData.user.email);
    console.log('✅ Token guardado');
}
```

### Ver los logs
1. Abre la consola de Postman: **View → Show Postman Console**
2. Ejecuta un request
3. Verás los logs en tiempo real

---

## ✅ Checklist de Verificación

Antes de continuar con otros módulos, verifica:

- [ ] Colección importada correctamente
- [ ] Ambiente "ZIGO Development" seleccionado
- [ ] Servidor corriendo (`npm run start:dev`)
- [ ] Health Check responde correctamente
- [ ] Register funciona y guarda el token
- [ ] Login funciona y guarda el token
- [ ] Variable `access_token` se llena automáticamente

---

**¡Listo para probar! 🚀**

Cuando agregues más endpoints (Productos, Carrito, Pedidos), simplemente añádelos a la colección y usarán automáticamente el token guardado.


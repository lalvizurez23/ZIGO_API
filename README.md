# Backend NestJS con TypeORM

Backend desarrollado con NestJS y TypeORM para gestión de base de datos.

## 📋 Requisitos Previos

- Node.js >= 20.11
- npm o yarn
- MySQL o PostgreSQL

## 🚀 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Configurar las variables de entorno en el archivo `.env`:
```
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=nombre_base_datos
PORT=3000
NODE_ENV=development
```

## ⚙️ Configuración de Base de Datos (IMPORTANTE)

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
- ✅ 6 tablas creadas (rol, permiso, rol_permiso, usuario, usuario_rol, logs_sesion)
- ✅ 5 roles insertados
- ✅ 20 permisos insertados  
- ✅ 3 usuarios de prueba creados

**🔑 Credenciales de acceso:**
- Email: `admin@ecommerce.com` / Password: `Admin123` (SUPER_ADMIN)
- Email: `vendedor@ecommerce.com` / Password: `Admin123` (VENDEDOR)
- Email: `clienteprueba@gmail.com` / Password: `Admin123` (CLIENTE)

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
├── config/           # Configuraciones (TypeORM, etc.)
├── database/
│   ├── entities/     # Entidades de TypeORM
│   └── migrations/   # Migraciones de base de datos
├── modules/          # Módulos de la aplicación
├── app.module.ts     # Módulo principal
├── app.controller.ts # Controlador principal
├── app.service.ts    # Servicio principal
└── main.ts          # Punto de entrada
```

## 🔗 Endpoints

- `GET /` - Mensaje de bienvenida
- `GET /health` - Health check de la aplicación

## 🛠️ Tecnologías

- **NestJS** - Framework backend
- **TypeORM** - ORM para bases de datos
- **TypeScript** - Lenguaje de programación
- **MySQL/PostgreSQL** - Base de datos

## 📝 Notas

- Las migraciones se encuentran en `src/database/migrations/`
- Las entidades se definen en `src/database/entities/`
- Los seeders se encuentran en `src/database/seeders/`
- `synchronize` está configurado como `false` para usar migraciones en lugar de sincronización automática

## 🔄 Flujo de Trabajo Completo

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env con credenciales de base de datos

# 3. Crear la base de datos manualmente en MySQL/PostgreSQL

# 4. Ejecutar migraciones (crear tablas)
npm run migration:run

# 5. Ejecutar seeder (insertar datos iniciales)
npm run seed

# 6. Iniciar la aplicación
npm run start:dev
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


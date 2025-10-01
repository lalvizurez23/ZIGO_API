# 🌱 Seeders - Datos Iniciales

Este directorio contiene los scripts para poblar la base de datos con datos iniciales.

## 📋 Datos que se Insertan

El seeder `initial-data.seeder.ts` inserta:

### 1. **5 Roles**
- `SUPER_ADMIN` - Acceso total al sistema
- `ADMIN` - Gestión de productos y órdenes
- `VENDEDOR` - Gestión de productos y visualización de órdenes
- `CLIENTE` - Realizar compras y gestionar carrito
- `INVITADO` - Solo visualización de productos

### 2. **20 Permisos**
Organizados por recursos:
- **Productos**: leer, crear, actualizar, eliminar
- **Órdenes**: leer, crear, actualizar, eliminar
- **Usuarios**: leer, crear, actualizar, eliminar
- **Carrito**: leer, crear, actualizar, eliminar
- **Reportes**: ventas, inventario
- **Configuración**: leer, actualizar

### 3. **Asignaciones Rol-Permiso**
Cada rol tiene permisos específicos:
- **SUPER_ADMIN**: TODOS los permisos (20)
- **ADMIN**: Gestión completa excepto algunos permisos de usuarios
- **VENDEDOR**: Productos, órdenes (leer/actualizar), reportes
- **CLIENTE**: Ver productos, gestionar carrito, crear órdenes
- **INVITADO**: Solo ver productos

### 4. **3 Usuarios de Prueba**

| Email | Password | Rol | Descripción |
|-------|----------|-----|-------------|
| `admin@ecommerce.com` | `Admin123!` | SUPER_ADMIN | Administrador principal |
| `vendedor@ecommerce.com` | `Admin123!` | VENDEDOR | Usuario vendedor |
| `clienteprueba@gmail.com` | `Admin123!` | CLIENTE | Cliente de prueba |

---

## 🚀 Cómo Ejecutar el Seeder

### Paso 1: Configura tu base de datos

Asegúrate de tener tu archivo `.env` configurado:

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=nombre_base_datos
```

### Paso 2: Crea las tablas (Migraciones)

Primero debes ejecutar las migraciones para crear las tablas:

```bash
npm run migration:run
```

### Paso 3: Ejecuta el Seeder

```bash
npm run seed
```

### Salida Esperada:

```
🚀 Conectando a la base de datos...
✅ Conexión establecida

🌱 Iniciando seeding de datos iniciales...
📋 Creando roles...
  ✅ Rol creado: SUPER_ADMIN
  ✅ Rol creado: ADMIN
  ...

🔐 Creando permisos...
  ✅ Permiso creado: productos.leer
  ...

🔗 Asignando permisos a roles...
  ✅ 47 permisos asignados a roles

👤 Creando usuarios de prueba...
  ✅ Usuario creado: admin@ecommerce.com (Password: Admin123!)
  ...

🔗 Asignando roles a usuarios...
  ✅ 3 roles asignados a usuarios

✅ ¡Seeding completado exitosamente!

📊 Resumen:
   - 5 roles creados
   - 20 permisos creados
   - 3 usuarios de prueba creados

🔑 Credenciales de acceso:
   Email: admin@ecommerce.com
   Email: vendedor@ecommerce.com
   Email: clienteprueba@gmail.com
   Password (todos): Admin123!
```

---

## ⚠️ Notas Importantes

1. **El seeder es idempotente**: Puedes ejecutarlo múltiples veces sin duplicar datos. Verifica si los datos ya existen antes de insertarlos.

2. **Contraseñas hasheadas**: Las contraseñas se hashean con `bcrypt` (10 rounds).

3. **IDs específicos**: Los roles y permisos tienen IDs específicos para mantener consistencia con las asignaciones.

4. **Ejecutar después de migraciones**: SIEMPRE ejecuta las migraciones primero para crear las tablas.

---

## 🔧 Personalización

Para modificar los datos iniciales, edita `initial-data.seeder.ts`:

```typescript
// Cambiar contraseña por defecto
const passwordHash = await bcrypt.hash('TuNuevaPassword!', 10);

// Agregar más usuarios
const usuarios = [
  // ... usuarios existentes
  {
    email: 'nuevo@ejemplo.com',
    passwordEncryptado: passwordHash,
    nombre: 'Nuevo',
    apellido: 'Usuario',
    estaActivo: true,
  },
];
```

---

## 🗑️ Limpiar Datos

Si necesitas limpiar todos los datos y volver a empezar:

```bash
# Revertir todas las migraciones (elimina tablas)
npm run migration:revert

# Volver a crear tablas
npm run migration:run

# Insertar datos iniciales
npm run seed
```

---

## 📝 Crear Nuevos Seeders

Para crear seeders adicionales (ej: productos de ejemplo):

1. Crea un archivo en `src/database/seeders/products.seeder.ts`
2. Exporta una función similar a `seedInitialData`
3. Impórtala en `run-seeder.ts`
4. Llámala después de `seedInitialData`

Ejemplo:

```typescript
// products.seeder.ts
export async function seedProducts(dataSource: DataSource) {
  // Insertar productos de ejemplo
}

// run-seeder.ts
await seedInitialData(dataSource);
await seedProducts(dataSource); // Nuevo seeder
```


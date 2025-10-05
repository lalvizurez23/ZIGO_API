# Seeders - Datos Iniciales

Este directorio contiene los scripts para poblar la base de datos con datos iniciales del sistema.

## Datos que se Insertan

El seeder `initial-data.seeder.ts` inserta:

### 1. Usuarios de Prueba (2)

| Email | Password | Descripción |
|-------|----------|-------------|
| `admin@ecommerce.com` | `Admin123` | Administrador del sistema |
| `usuario@ejemplo.com` | `Usuario123` | Cliente de prueba |

**Nota:** Las contraseñas se hashean con bcrypt (10 rounds).

### 2. Carritos Activos (2)

Se crea automáticamente un carrito activo para cada usuario:
- Carrito para `admin@ecommerce.com`
- Carrito para `usuario@ejemplo.com`

**Arquitectura:**
- Un carrito activo por usuario (esta_activo = 1)
- Carrito persistente (no se elimina después de compra)
- Reutilizable en todas las sesiones

### 3. Categorías (4)

- Electrónica
- Ropa
- Hogar
- Deportes

### 4. Productos (11)

**Electrónica:**
- Laptop HP 15-dy2021la (Q3,500.00)
- Mouse Logitech M720 (Q250.00)
- Teclado Mecánico RGB (Q450.00)
- Auriculares Sony WH-1000XM4 (Q1,200.00)

**Ropa:**
- Camiseta Polo Clásica (Q120.00)
- Jeans Slim Fit Premium (Q280.00)

**Hogar:**
- Lámpara de Mesa LED (Q150.00)
- Juego de Sábanas Premium (Q320.00)

**Deportes:**
- Pelota de Fútbol Profesional (Q180.00)
- Pesas Ajustables 20kg (Q550.00)
- Tapete de Yoga Premium (Q95.00)

---

## Cómo Ejecutar el Seeder

### Paso 1: Configura tu base de datos

Asegúrate de tener tu archivo `.env` configurado:

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=zigo_ecommerce
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
Conectando a la base de datos...
Conexión establecida

Iniciando seeding de datos iniciales...

Creando usuarios...
  Usuario creado: admin@ecommerce.com
  Usuario creado: usuario@ejemplo.com

Creando carritos para usuarios...
  Carrito creado para usuario: admin@ecommerce.com (ID: 1)
  Carrito creado para usuario: usuario@ejemplo.com (ID: 2)

Creando categorías...
  Categoría creada: Electrónica
  Categoría creada: Ropa
  Categoría creada: Hogar
  Categoría creada: Deportes

Creando productos...
  Producto creado: Laptop HP 15-dy2021la
  Producto creado: Mouse Logitech M720
  ...

Seeding completado exitosamente

Resumen:
  - 2 usuarios creados
  - 2 carritos activos creados
  - 4 categorías creadas
  - 11 productos creados

Credenciales de acceso:
  Admin: admin@ecommerce.com / Admin123
  Cliente: usuario@ejemplo.com / Usuario123
```

---

## Notas Importantes

### 1. El seeder es idempotente
Puedes ejecutarlo múltiples veces sin duplicar datos. Verifica si los datos ya existen antes de insertarlos.

```typescript
// Ejemplo de verificación
const existingUser = await usuarioRepository.findOne({
  where: { email: usuarioData.email }
});

if (!existingUser) {
  await usuarioRepository.save(usuarioData);
}
```

### 2. Contraseñas hasheadas
Las contraseñas se hashean con bcrypt (10 rounds) antes de insertarlas:

```typescript
const passwordHash = await bcrypt.hash('Admin123', 10);
```

### 3. Carritos automáticos
Se crea un carrito activo para cada usuario al ejecutar el seeder:

```typescript
const carrito = await carritoRepository.save({
  idUsuario: usuario.idUsuario,
  estaActivo: true,
});
```

### 4. Ejecutar después de migraciones
SIEMPRE ejecuta las migraciones primero para crear las tablas:

```bash
npm run migration:run  # Primero
npm run seed           # Después
```

---

## Personalización

Para modificar los datos iniciales, edita `initial-data.seeder.ts`:

### Cambiar contraseñas
```typescript
const passwordHash = await bcrypt.hash('TuNuevaPassword', 10);
```

### Agregar más usuarios
```typescript
const usuarios = [
  // ... usuarios existentes
  {
    email: 'nuevo@ejemplo.com',
    password: passwordHash,
    nombre: 'Nuevo',
    apellido: 'Usuario',
    telefono: '555-5555',
    direccion: 'Nueva Dirección',
  },
];
```

### Agregar más productos
```typescript
const productos = [
  // ... productos existentes
  {
    idCategoria: 1,
    nombre: 'Nuevo Producto',
    descripcion: 'Descripción del producto',
    precio: 500.00,
    stock: 10,
    imagenUrl: 'https://via.placeholder.com/400',
    estaActivo: true,
  },
];
```

---

## Limpiar Datos

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

## Crear Nuevos Seeders

Para crear seeders adicionales (ej: más productos):

### 1. Crea un archivo
```typescript
// src/database/seeders/additional-products.seeder.ts
export async function seedAdditionalProducts(dataSource: DataSource) {
  const productoRepository = dataSource.getRepository(Producto);
  
  // Insertar productos adicionales
  const productos = [
    // ... tus productos
  ];
  
  for (const productoData of productos) {
    const existing = await productoRepository.findOne({
      where: { nombre: productoData.nombre }
    });
    
    if (!existing) {
      await productoRepository.save(productoData);
    }
  }
}
```

### 2. Impórtalo en run-seeder.ts
```typescript
import { seedInitialData } from './initial-data.seeder';
import { seedAdditionalProducts } from './additional-products.seeder';

async function runSeeders() {
  await seedInitialData(dataSource);
  await seedAdditionalProducts(dataSource); // Nuevo seeder
}
```

---

## Arquitectura de Carrito

El seeder implementa la arquitectura de carrito persistente:

**Características:**
- Cada usuario tiene UN carrito activo desde el registro
- El carrito NO se elimina después de una compra
- El carrito se vacía (elimina items) pero permanece activo
- El mismo carrito se reutiliza en todas las sesiones

**Flujo:**
1. Usuario se registra → Seeder crea carrito activo
2. Usuario agrega productos → Items se agregan al carrito
3. Usuario realiza checkout → Se crea pedido y se vacían items
4. Nueva compra → Reutiliza el mismo carrito (vacío)

---

## Resumen

- 2 usuarios de prueba con contraseñas hasheadas
- 2 carritos activos (uno por usuario)
- 4 categorías de productos
- 11 productos de ejemplo con stock
- Seeder idempotente (puede ejecutarse múltiples veces)
- Arquitectura de carrito persistente implementada
- Datos listos para desarrollo y pruebas
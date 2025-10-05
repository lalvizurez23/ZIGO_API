# Entidades de TypeORM - E-commerce ZIGO

Sistema de e-commerce con carrito persistente y gestión de pedidos.

## Entidades (7 total)

### 1. Usuario (`usuario.entity.ts`)
Usuarios del sistema con autenticación JWT.

**Campos:**
- `idUsuario`: ID autogenerado
- `email`: Email único (validado)
- `password`: Contraseña hasheada con bcrypt (10 rounds)
- `nombre`, `apellido`: Datos personales
- `telefono`, `direccion`: Datos de contacto (opcionales)
- `estaActivo`: Estado del usuario (BIT)
- `fechaCreacion`, `fechaActualizacion`: Timestamps automáticos

**Relaciones:**
- `carritos`: Uno o más carritos (historial)
- `pedidos`: Historial de pedidos del usuario

**Nota:** Al crear un usuario, se crea automáticamente un carrito activo.

---

### 2. Categoria (`categoria.entity.ts`)
Categorías de productos del catálogo.

**Campos:**
- `idCategoria`: ID autogenerado
- `nombre`: Nombre único de la categoría
- `descripcion`: Descripción (opcional)
- `imagenUrl`: URL de imagen (opcional)
- `estaActivo`: Estado (BIT)
- `fechaCreacion`, `fechaActualizacion`: Timestamps automáticos

**Relaciones:**
- `productos`: Productos en esta categoría

---

### 3. Producto (`producto.entity.ts`)
Catálogo de productos disponibles.

**Campos:**
- `idProducto`: ID autogenerado
- `idCategoria`: FK a Categoria
- `nombre`: Nombre del producto
- `descripcion`: Descripción detallada (TEXT)
- `precio`: Precio de venta (DECIMAL 18,2)
- `stock`: Cantidad disponible (INT)
- `imagenUrl`: URL de imagen del producto (opcional)
- `estaActivo`: Estado (BIT)
- `fechaCreacion`, `fechaActualizacion`: Timestamps automáticos

**Relaciones:**
- `categoria`: Categoría del producto
- `detallesPedido`: Pedidos que incluyen este producto
- `carritoItems`: Items en carritos

**Nota:** El precio usa DECIMAL(18,2) para precisión monetaria.

---

### 4. Carrito (`carrito.entity.ts`)
Carritos de compras persistentes (uno activo por usuario).

**Campos:**
- `idCarrito`: ID autogenerado
- `idUsuario`: FK a Usuario
- `estaActivo`: Si el carrito está activo (BIT)
- `fechaCreacion`, `fechaActualizacion`: Timestamps automáticos

**Relaciones:**
- `usuario`: Usuario dueño del carrito
- `items`: Items en el carrito

**Arquitectura:**
- Cada usuario tiene UN SOLO carrito activo (esta_activo = 1)
- El carrito se crea al registrar el usuario
- El carrito NO se elimina después de una compra, solo se vacía
- El carrito se reutiliza en todas las sesiones del usuario

---

### 5. CarritoItem (`carrito-item.entity.ts`)
Items individuales en el carrito.

**Campos:**
- `idCarritoItem`: ID autogenerado
- `idCarrito`: FK a Carrito
- `idProducto`: FK a Producto
- `cantidad`: Cantidad del producto (INT)
- `fechaAgregado`: Cuándo se agregó (DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)

**Constraint único:** `(id_carrito, id_producto)` - Un producto por carrito

**Relaciones:**
- `carrito`: Carrito al que pertenece
- `producto`: Producto agregado

**Nota:** `fechaAgregado` tiene DEFAULT CURRENT_TIMESTAMP para registrar automáticamente cuándo se agregó.

---

### 6. Pedido (`pedido.entity.ts`)
Pedidos realizados por usuarios.

**Campos:**
- `idPedido`: ID autogenerado
- `idUsuario`: FK a Usuario
- `numeroPedido`: Número único (ej: PED-2025-0001)
- `total`: Total del pedido (DECIMAL 18,2)
- `estado`: ENUM (pendiente, procesando, completado, cancelado)
- `metodoPago`: Método de pago usado (VARCHAR 50, opcional)
- `direccionEnvio`: Dirección de envío (VARCHAR 500, opcional)
- `notas`: Notas adicionales (TEXT, opcional)
- `fechaPedido`: Fecha de creación (DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)

**Estados disponibles:**
- `pendiente`: Recién creado
- `procesando`: En proceso de preparación
- `completado`: Entregado al cliente
- `cancelado`: Cancelado por usuario o admin

**Relaciones:**
- `usuario`: Usuario que hizo el pedido
- `detalles`: Items del pedido

**Nota:** `fechaPedido` tiene DEFAULT CURRENT_TIMESTAMP para registrar automáticamente la fecha.

---

### 7. DetallePedido (`detalle-pedido.entity.ts`)
Items de cada pedido (snapshot del producto al momento de la compra).

**Campos:**
- `idDetallePedido`: ID autogenerado
- `idPedido`: FK a Pedido
- `idProducto`: FK a Producto
- `cantidad`: Cantidad comprada (INT)
- `precioUnitario`: Precio al momento de la compra (DECIMAL 18,2)
- `subtotal`: Total del item (DECIMAL 18,2)

**Relaciones:**
- `pedido`: Pedido al que pertenece
- `producto`: Producto comprado

**Nota:** Se guarda el precio al momento de la compra para mantener histórico correcto.

---

## Diagrama de Relaciones

```
Usuario (1)
   ├── Carrito (1 activo) ← Arquitectura de carrito persistente
   │      └── CarritoItem (N) → Producto (1)
   │
   └── Pedido (N)
          └── DetallePedido (N) → Producto (1)

Categoria (1)
   └── Producto (N)
```

---

## Relaciones Detalladas

- **Usuario → Carrito**: Un usuario tiene UN carrito activo (puede tener históricos inactivos)
- **Carrito → CarritoItem**: Un carrito tiene múltiples items
- **CarritoItem → Producto**: Cada item referencia un producto
- **Usuario → Pedido**: Un usuario puede tener múltiples pedidos
- **Pedido → DetallePedido**: Un pedido tiene múltiples items
- **DetallePedido → Producto**: Cada detalle referencia un producto
- **Categoria → Producto**: Una categoría tiene múltiples productos

---

## Uso en Módulos NestJS

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../../database/entities/usuario.entity';
import { Producto } from '../../database/entities/producto.entity';
import { Carrito } from '../../database/entities/carrito.entity';
import { Pedido } from '../../database/entities/pedido.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Producto, Carrito, Pedido])
  ],
  // ...
})
export class EcommerceModule {}

// Nota: Importaciones directas - sin archivos index.ts
```

---

## Características Especiales

### Precisión Monetaria
- Todos los campos de precio usan `DECIMAL(18,2)`
- Garantiza precisión en cálculos monetarios
- Evita errores de redondeo con FLOAT

### Fechas Automáticas
- `fechaAgregado` en CarritoItem: `DEFAULT CURRENT_TIMESTAMP`
- `fechaPedido` en Pedido: `DEFAULT CURRENT_TIMESTAMP`
- Ambas son `NOT NULL` para integridad de datos

### Carrito Persistente
- Un solo carrito activo por usuario
- Se crea automáticamente al registrar usuario
- NO se elimina después de compra (solo se vacía)
- Reutilizable en todas las sesiones

### Snapshot de Precios
- DetallePedido guarda el precio al momento de la compra
- Mantiene histórico correcto aunque cambien los precios
- Permite auditoría de transacciones

---

## Resumen

- 7 entidades core del sistema
- Relaciones optimizadas para e-commerce
- Arquitectura de carrito persistente
- Precisión monetaria con DECIMAL
- Fechas automáticas con DEFAULT
- Snapshot de precios en pedidos
- Todas las funcionalidades de e-commerce implementadas
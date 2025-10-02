# Entidades de TypeORM - Carrito de Compras

Sistema simplificado de e-commerce con carrito de compras.

## 📋 Entidades (7 total)

### 1. **Usuario** (`usuario.entity.ts`)
Usuarios del sistema.

**Campos:**
- `idUsuario`: ID autogenerado
- `email`: Email único
- `password`: Contraseña hasheada con bcrypt
- `nombre`, `apellido`: Datos personales
- `telefono`, `direccion`: Datos de contacto
- `estaActivo`: Estado del usuario

**Relaciones:**
- `carritos`: Uno o más carritos
- `pedidos`: Historial de pedidos

---

### 2. **Categoria** (`categoria.entity.ts`)
Categorías de productos.

**Campos:**
- `idCategoria`: ID autogenerado
- `nombre`: Nombre único de la categoría
- `descripcion`: Descripción
- `imagenUrl`: URL de imagen
- `estaActivo`: Estado

**Relaciones:**
- `productos`: Productos en esta categoría

---

### 3. **Producto** (`producto.entity.ts`)
Catálogo de productos.

**Campos:**
- `idProducto`: ID autogenerado
- `idCategoria`: FK a Categoria
- `nombre`: Nombre del producto
- `descripcion`: Descripción detallada
- `precio`: Precio de venta
- `stock`: Cantidad disponible
- `imagenUrl`: URL de imagen del producto
- `estaActivo`: Estado

**Relaciones:**
- `categoria`: Categoría del producto
- `detallesPedido`: Pedidos que incluyen este producto
- `carritoItems`: Items en carritos

---

### 4. **Carrito** (`carrito.entity.ts`)
Carritos de compras de usuarios.

**Campos:**
- `idCarrito`: ID autogenerado
- `idUsuario`: FK a Usuario
- `estaActivo`: Si el carrito está activo
- `fechaCreacion`, `fechaActualizacion`: Timestamps

**Relaciones:**
- `usuario`: Usuario dueño del carrito
- `items`: Items en el carrito

---

### 5. **CarritoItem** (`carrito-item.entity.ts`)
Items individuales en el carrito.

**Campos:**
- `idCarritoItem`: ID autogenerado
- `idCarrito`: FK a Carrito
- `idProducto`: FK a Producto
- `cantidad`: Cantidad del producto
- `fechaAgregado`: Cuándo se agregó

**Constraint único:** `(id_carrito, id_producto)` - Un producto por carrito

**Relaciones:**
- `carrito`: Carrito al que pertenece
- `producto`: Producto agregado

---

### 6. **Pedido** (`pedido.entity.ts`)
Pedidos realizados por usuarios.

**Campos:**
- `idPedido`: ID autogenerado
- `idUsuario`: FK a Usuario
- `numeroPedido`: Número único (PED-2024-0001)
- `total`: Total del pedido
- `estado`: ENUM (pendiente, procesando, completado, cancelado)
- `metodoPago`: Método de pago usado
- `direccionEnvio`: Dirección de envío
- `notas`: Notas adicionales
- `fechaPedido`: Fecha de creación

**Estados disponibles:**
- `PENDIENTE`: Recién creado
- `PROCESANDO`: En proceso
- `COMPLETADO`: Entregado
- `CANCELADO`: Cancelado

**Relaciones:**
- `usuario`: Usuario que hizo el pedido
- `detalles`: Items del pedido

---

### 7. **DetallePedido** (`detalle-pedido.entity.ts`)
Items de cada pedido.

**Campos:**
- `idDetallePedido`: ID autogenerado
- `idPedido`: FK a Pedido
- `idProducto`: FK a Producto
- `cantidad`: Cantidad comprada
- `precioUnitario`: Precio al momento de la compra
- `subtotal`: Total del item

**Relaciones:**
- `pedido`: Pedido al que pertenece
- `producto`: Producto comprado

---

## 📊 Diagrama de Relaciones

```
Usuario
   ├── Carrito
   │      └── CarritoItem → Producto
   │
   └── Pedido
          └── DetallePedido → Producto

Categoria
   └── Producto
```

---

## 🔗 Relaciones Detalladas

- **Usuario → Carrito**: Un usuario puede tener múltiples carritos (históricos)
- **Carrito → CarritoItem**: Un carrito tiene múltiples items
- **CarritoItem → Producto**: Cada item referencia un producto
- **Usuario → Pedido**: Un usuario puede tener múltiples pedidos
- **Pedido → DetallePedido**: Un pedido tiene múltiples items
- **DetallePedido → Producto**: Cada detalle referencia un producto
- **Categoria → Producto**: Una categoría tiene múltiples productos

---

## 📝 Uso en Módulos NestJS

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

## ✅ Resumen

- ✅ 7 entidades core
- ✅ Relaciones simplificadas
- ✅ Optimizado para MVP
- ✅ Todas las funcionalidades básicas de e-commerce

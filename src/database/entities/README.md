# Entidades de TypeORM - E-Commerce Completo

Este directorio contiene todas las entidades del sistema de e-commerce con gestión completa de productos, inventario, pedidos y facturación.

## 📋 Resumen de Entidades

**Total: 24 entidades** organizadas en 8 módulos

---

## 🔐 MÓDULO 1: Autenticación y Usuarios (6 entidades)

### 1. **Rol** (`rol.entity.ts`)
Roles del sistema (SUPER_ADMIN, ADMIN, VENDEDOR, CLIENTE, INVITADO).

**Relaciones:**
- `rolPermisos`: Muchos permisos a través de `RolPermiso`
- `usuarioRoles`: Muchos usuarios a través de `UsuarioRol`

### 2. **Permiso** (`permiso.entity.ts`)
Permisos granulares del sistema (crear, leer, actualizar, eliminar).

### 3. **RolPermiso** (`rol-permiso.entity.ts`)
Tabla intermedia Rol ↔ Permiso (muchos a muchos).

### 4. **Usuario** (`usuario.entity.ts`)
Usuarios del sistema con email, password encriptado y datos personales.

### 5. **UsuarioRol** (`usuario-rol.entity.ts`)
Tabla intermedia Usuario ↔ Rol (muchos a muchos).

### 6. **LogsSesion** (`logs-sesion.entity.ts`)
Auditoría de inicios de sesión (IP, user agent, éxito/fallo).

---

## 🛍️ MÓDULO 2: Catálogo de Productos (4 entidades)

### 7. **Categoria** (`categoria.entity.ts`)
Categorías jerárquicas de productos (con subcategorías).

**Campos destacados:**
- `categoriaPadreId`: Para crear jerarquías
- `imagenUrl`: Imagen de la categoría
- `orden`: Para ordenamiento personalizado

**Relaciones:**
- `categoriaPadre`: Categoría padre (autorreferencia)
- `subcategorias`: Categorías hijas
- `productos`: Productos en esta categoría

### 8. **Proveedor** (`proveedor.entity.ts`)
Proveedores de productos.

**Campos Guatemala:**
- `departamento`: Departamento
- `municipio`: Municipio
- `nit`: Número de Identificación Tributaria

### 9. **Producto** (`producto.entity.ts`)
Catálogo de productos.

**Campos principales:**
- `codigoProducto`: SKU único
- `nombreProducto`: Nombre del producto
- `precioCompra`, `precioVenta`: Precios
- `precioDescuento`, `porcentajeDescuento`: Descuentos
- `imagenPrincipal`: URL de imagen principal

**Relaciones:**
- `categoria`: Categoría del producto
- `proveedor`: Proveedor
- `imagenes`: Galería de imágenes
- `inventarios`: Stock en bodegas
- `detallesPedido`: Pedidos que incluyen este producto
- `carritoItems`: Items en carritos

### 10. **ProductoImagen** (`producto-imagen.entity.ts`)
Galería de imágenes de productos (múltiples imágenes por producto).

---

## 📦 MÓDULO 3: Inventario y Bodegas (3 entidades)

### 11. **Bodega** (`bodega.entity.ts`)
Almacenes/bodegas para gestión de stock.

**Campos Guatemala:**
- `codigo`: Código único de bodega
- `departamento`: Departamento
- `municipio`: Municipio

### 12. **Inventario** (`inventario.entity.ts`)
Stock de productos por bodega.

**Campos principales:**
- `cantidadDisponible`: Stock actual
- `cantidadMinima`, `cantidadMaxima`: Límites de stock
- `ubicacionFisica`: Ubicación en bodega (ej: "Pasillo 3, Estante A")

**Constraint único:** `(id_producto, id_bodega)` - Un registro por producto por bodega

### 13. **MovimientoInventario** (`movimiento-inventario.entity.ts`)
Historial de movimientos de inventario.

**Tipos de movimiento:** `ENTRADA`, `SALIDA`

**Campos de auditoría:**
- `cantidadAnterior`, `cantidadNueva`: Trazabilidad
- `numeroDocumento`: Número de factura/orden relacionada
- `motivo`: Descripción del movimiento

---

## 📍 MÓDULO 4: Direcciones (1 entidad)

### 14. **Direccion** (`direccion.entity.ts`)
Direcciones de envío de usuarios.

**Campos Guatemala:**
- `departamento`: Departamento
- `municipio`: Municipio  
- `pais`: Por defecto 'Guatemala'

**Flags:**
- `esPrincipal`: Dirección principal del usuario
- `estaActivo`: Si está activa

---

## 🛒 MÓDULO 5: Pedidos y Ventas (4 entidades)

### 15. **EstadoPedido** (`estado-pedido.entity.ts`)
Estados posibles de pedidos (Pendiente, Procesando, Enviado, Entregado, Cancelado).

**Campos:**
- `esEstadoFinal`: Indica si es un estado terminal

### 16. **Pedido** (`pedido.entity.ts`)
Pedidos de clientes.

**Campos principales:**
- `numeroPedido`: Número único (ej: PED-2024-0001)
- `subtotal`, `descuento`, `impuestos`, `costoEnvio`, `total`: Montos
- `metodoPago`: Método de pago usado
- `notasCliente`, `notasInternas`: Notas
- `fechaEstimadaEntrega`, `fechaEntregaReal`: Tracking de entrega

**Relaciones:**
- `usuario`: Cliente que hizo el pedido
- `direccionEnvio`: Dirección de envío
- `estadoPedido`: Estado actual
- `detalles`: Productos en el pedido
- `historialEstados`: Historial de cambios de estado
- `factura`: Factura generada (1:1)

### 17. **DetallePedido** (`detalle-pedido.entity.ts`)
Productos incluidos en cada pedido.

**Snapshots (datos al momento de la compra):**
- `nombreProducto`: Nombre del producto
- `codigoSku`: SKU del producto
- `precioUnitario`: Precio al momento de la compra

### 18. **HistorialEstadoPedido** (`historial-estado-pedido.entity.ts`)
Auditoría de cambios de estado de pedidos.

**Campos:**
- `idEstadoAnterior`, `idEstadoNuevo`: Estados
- `idUsuario`: Quién cambió el estado
- `comentario`: Comentario del cambio

---

## 🧾 MÓDULO 6: Facturación (2 entidades)

### 19. **Factura** (`factura.entity.ts`)
Facturas generadas para pedidos.

**Relación:** 1 pedido = 1 factura (única)

**Campos principales:**
- `numeroFactura`: Número único (ej: FAC-2024-0001)
- `estado`: 'pendiente', 'pagada', 'anulada'
- `idMetodoPago`: Método de pago usado
- `fechaEmision`, `fechaVencimiento`, `fechaPago`: Fechas
- `motivoAnulacion`: Si fue anulada

**Relaciones:**
- `pedido`: Pedido asociado (1:1)
- `usuario`: Usuario/cliente
- `metodoPago`: Método de pago
- `detalles`: Items de la factura

### 20. **DetalleFactura** (`detalle-factura.entity.ts`)
Items de cada factura.

**Campos:**
- `descripcion`: Descripción del item
- `cantidad`, `precioUnitario`: Cantidades y precios
- `descuento`, `iva`: Descuentos e impuestos
- `subtotal`: Subtotal del item

---

## 💳 MÓDULO 7: Métodos de Pago (1 entidad)

### 21. **MetodoPago** (`metodo-pago.entity.ts`)
Métodos de pago disponibles en el sistema.

**Tipos:** 'tarjeta', 'transferencia', 'efectivo', 'otro'

**Campos:**
- `nombre`: Nombre del método (ej: "Tarjeta de Crédito")
- `tipo`: Tipo de método de pago
- `estaActivo`: Si está activo
- `descripcion`: Descripción

---

## 🛒 MÓDULO 8: Carrito de Compras (2 entidades)

### 22. **Carrito** (`carrito.entity.ts`)
Carritos de compras de usuarios.

**Campos:**
- `idUsuario`: Usuario dueño del carrito
- `fechaExpiracion`: Fecha de expiración del carrito
- `estaActivo`: Si el carrito está activo

### 23. **CarritoItem** (`carrito-item.entity.ts`)
Items en el carrito.

**Constraint único:** `(id_carrito, id_producto)` - Un producto por carrito

**Campos:**
- `cantidad`: Cantidad del producto
- `precioUnitario`: Precio al agregar (snapshot)
- `fechaAgregado`: Cuándo se agregó

---

## 📊 Diagrama de Relaciones

```
USUARIOS Y AUTENTICACIÓN:
Usuario ←→ UsuarioRol ←→ Rol ←→ RolPermiso ←→ Permiso
   ↓
LogsSesion

PRODUCTOS E INVENTARIO:
Categoria (jerárquica)
   ↓
Producto ←→ ProductoImagen
   ↓        ↓
Proveedor  Inventario ←→ Bodega
              ↓
         MovimientoInventario

PEDIDOS Y FACTURACIÓN:
Usuario → Direccion
   ↓         ↓
Usuario → Pedido ←→ EstadoPedido
   ↓         ↓
   ↓    DetallePedido → Producto
   ↓         ↓
   ↓    HistorialEstadoPedido
   ↓         ↓
Usuario → Factura ←→ MetodoPago
             ↓
        DetalleFactura

CARRITO:
Usuario → Carrito → CarritoItem → Producto
```

---

## 🔗 Adaptaciones para Guatemala

Las siguientes entidades tienen campos específicos para Guatemala:

- **Proveedor**: `departamento`, `municipio`, `nit`
- **Bodega**: `departamento`, `municipio`
- **Direccion**: `departamento`, `municipio`, país default 'Guatemala'

---

## 📝 Notas de Implementación

1. **Snapshots**: Los pedidos y facturas guardan snapshots de datos (nombre producto, precio) para mantener historial inmutable.

2. **Constraint únicos**:
   - Un producto por categoría tiene código único
   - Un producto por bodega en inventario
   - Un producto por carrito en carrito_item

3. **Cascadas configuradas**:
   - `CASCADE` en relaciones padre-hijo (categorías, detalles)
   - `SET NULL` en relaciones opcionales (proveedor)
   - `NO ACTION` en relaciones de auditoría

4. **Índices optimizados** en todos los campos de búsqueda frecuente.

5. **Timestamps automáticos** con `@CreateDateColumn` y `@UpdateDateColumn`.

---

## 🚀 Uso en Módulos NestJS

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto, Categoria, Inventario } from '@/database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Categoria, Inventario])
  ],
  // ...
})
export class ProductosModule {}
```

---

## ✅ Total: 24 Entidades

- ✅ 6 Autenticación y Usuarios
- ✅ 4 Productos
- ✅ 3 Inventario
- ✅ 1 Direcciones
- ✅ 4 Pedidos
- ✅ 2 Facturación
- ✅ 1 Métodos de Pago
- ✅ 2 Carrito
- ✅ 1 Auditoría (en usuario: LogsSesion)

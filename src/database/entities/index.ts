// Exportar todas las entidades desde un solo archivo

// ============================================
// Módulo de Autenticación y Usuarios
// ============================================
export { Rol } from './rol.entity';
export { Permiso } from './permiso.entity';
export { RolPermiso } from './rol-permiso.entity';
export { Usuario } from './usuario.entity';
export { UsuarioRol } from './usuario-rol.entity';
export { LogsSesion } from './logs-sesion.entity';

// ============================================
// Módulo de Productos
// ============================================
export { Categoria } from './categoria.entity';
export { Proveedor } from './proveedor.entity';
export { Producto } from './producto.entity';
export { ProductoImagen } from './producto-imagen.entity';

// ============================================
// Módulo de Inventario
// ============================================
export { Bodega } from './bodega.entity';
export { Inventario } from './inventario.entity';
export { MovimientoInventario } from './movimiento-inventario.entity';

// ============================================
// Módulo de Direcciones
// ============================================
export { Direccion } from './direccion.entity';

// ============================================
// Módulo de Pedidos
// ============================================
export { EstadoPedido } from './estado-pedido.entity';
export { Pedido } from './pedido.entity';
export { DetallePedido } from './detalle-pedido.entity';
export { HistorialEstadoPedido } from './historial-estado-pedido.entity';

// ============================================
// Módulo de Facturación
// ============================================
export { Factura } from './factura.entity';
export { DetalleFactura } from './detalle-factura.entity';

// ============================================
// Módulo de Pagos
// ============================================
export { MetodoPago } from './metodo-pago.entity';

// ============================================
// Módulo de Carrito
// ============================================
export { Carrito } from './carrito.entity';
export { CarritoItem } from './carrito-item.entity';

-- ============================================
-- SISTEMA DE CARRITO DE COMPRAS - SCHEMA SIMPLE
-- ============================================
-- Versión: 1.0
-- Base de datos: MySQL
-- Descripción: Sistema simple de e-commerce con carrito de compras
-- ============================================

-- ============================================
-- TABLA: usuarios
-- Descripción: Usuarios del sistema
-- ============================================
CREATE TABLE usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NULL,
    direccion VARCHAR(500) NULL,
    esta_activo BIT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT CK_usuarios_email CHECK (email LIKE '%_@__%.__%'),
    CONSTRAINT UQ_usuarios_email UNIQUE (email)
);

-- Índices
CREATE INDEX IX_usuarios_email ON usuario(email);
GO

-- ============================================
-- TABLA: categorias
-- Descripción: Categorías de productos
-- ============================================
CREATE TABLE categoria (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(500) NULL,
    imagen_url VARCHAR(500) NULL,
    esta_activo BIT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT CK_categorias_nombre CHECK (nombre <> '')
);

-- Índices
CREATE INDEX IX_categorias_nombre ON categoria(nombre);
GO

-- ============================================
-- TABLA: productos
-- Descripción: Catálogo de productos
-- ============================================
CREATE TABLE producto (
    id_producto INT PRIMARY KEY AUTO_INCREMENT,
    id_categoria INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion VARCHAR(2000) NULL,
    precio DECIMAL(18,2) NOT NULL,
    stock INT DEFAULT 0,
    imagen_url VARCHAR(500) NULL,
    esta_activo BIT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT FK_productos_categoria FOREIGN KEY (id_categoria) 
        REFERENCES categoria(id_categoria) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT CK_productos_nombre CHECK (nombre <> ''),
    CONSTRAINT CK_productos_precio CHECK (precio >= 0),
    CONSTRAINT CK_productos_stock CHECK (stock >= 0)
);

-- Índices
CREATE INDEX IX_productos_nombre ON producto(nombre);
CREATE INDEX IX_productos_categoria ON producto(id_categoria);
CREATE INDEX IX_productos_activo ON producto(esta_activo);
GO

-- ============================================
-- TABLA: carrito
-- Descripción: Carritos de compras de usuarios
-- ============================================
CREATE TABLE carrito (
    id_carrito INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    esta_activo BIT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT FK_carrito_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IX_carrito_usuario ON carrito(id_usuario);
GO

-- ============================================
-- TABLA: carrito_item
-- Descripción: Items en el carrito
-- ============================================
CREATE TABLE carrito_item (
    id_carrito_item INT PRIMARY KEY AUTO_INCREMENT,
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    fecha_agregado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT FK_carrito_item_carrito FOREIGN KEY (id_carrito) 
        REFERENCES carrito(id_carrito) ON DELETE CASCADE,
    CONSTRAINT FK_carrito_item_producto FOREIGN KEY (id_producto) 
        REFERENCES producto(id_producto) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT CK_carrito_item_cantidad CHECK (cantidad > 0),
    CONSTRAINT UQ_carrito_item_producto UNIQUE (id_carrito, id_producto)
);

-- Índices
CREATE INDEX IX_carrito_item_carrito ON carrito_item(id_carrito);
GO

-- ============================================
-- TABLA: pedidos
-- Descripción: Pedidos realizados por usuarios
-- ============================================
CREATE TABLE pedido (
    id_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    numero_pedido VARCHAR(50) NOT NULL UNIQUE,
    total DECIMAL(18,2) NOT NULL,
    estado ENUM('pendiente', 'procesando', 'completado', 'cancelado') DEFAULT 'pendiente',
    metodo_pago VARCHAR(50) NULL,
    direccion_envio VARCHAR(500) NULL,
    notas VARCHAR(1000) NULL,
    fecha_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT FK_pedidos_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) ON DELETE NO ACTION,
    
    -- Constraints
    CONSTRAINT CK_pedidos_total CHECK (total >= 0)
);

-- Índices
CREATE INDEX IX_pedidos_usuario ON pedido(id_usuario);
CREATE INDEX IX_pedidos_fecha ON pedido(fecha_pedido DESC);
CREATE INDEX IX_pedidos_estado ON pedido(estado);
CREATE INDEX IX_pedidos_numero ON pedido(numero_pedido);
GO

-- ============================================
-- TABLA: detalle_pedido
-- Descripción: Productos incluidos en cada pedido
-- ============================================
CREATE TABLE detalle_pedido (
    id_detalle_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(18,2) NOT NULL,
    subtotal DECIMAL(18,2) NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT FK_detalle_pedido_pedido FOREIGN KEY (id_pedido) 
        REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    CONSTRAINT FK_detalle_pedido_producto FOREIGN KEY (id_producto) 
        REFERENCES producto(id_producto) ON DELETE NO ACTION,
    
    -- Constraints
    CONSTRAINT CK_detalle_cantidad CHECK (cantidad > 0),
    CONSTRAINT CK_detalle_precio CHECK (precio_unitario >= 0)
);

-- Índices
CREATE INDEX IX_detalle_pedido ON detalle_pedido(id_pedido);
GO

-- ============================================
-- DATOS INICIALES - USUARIOS
-- ============================================
-- Nota: Las contraseñas deben ser hasheadas con bcrypt antes de insertar
-- Ejemplo de hash bcrypt para 'password123': $2a$10$YourHashedPasswordHere
INSERT INTO usuario (email, password, nombre, apellido, telefono, direccion) VALUES
('admin@ecommerce.com', '$2a$10$YourHashedPasswordHere', 'Admin', 'Sistema', '555-0100', 'Ciudad de Guatemala'),
('usuario@ejemplo.com', '$2a$10$YourHashedPasswordHere', 'Juan', 'Pérez', '555-0101', 'Zona 10, Guatemala');
GO

-- ============================================
-- DATOS INICIALES - CARRITOS
-- ============================================
-- Crear carrito activo para cada usuario registrado
INSERT INTO carrito (id_usuario, esta_activo) VALUES
(1, 1),  -- Carrito para admin@ecommerce.com
(2, 1);  -- Carrito para usuario@ejemplo.com
GO

-- ============================================
-- DATOS INICIALES - CATEGORÍAS
-- ============================================
INSERT INTO categoria (nombre, descripcion) VALUES
('Electrónica', 'Productos electrónicos y tecnología'),
('Ropa', 'Ropa y accesorios'),
('Hogar', 'Artículos para el hogar'),
('Deportes', 'Artículos deportivos');
GO

-- ============================================
-- DATOS INICIALES - PRODUCTOS
-- ============================================
INSERT INTO producto (id_categoria, nombre, descripcion, precio, stock) VALUES
(1, 'Laptop HP 15-dy2021la', 'Laptop HP con procesador Intel Core i5, 8GB RAM, 256GB SSD', 3500.00, 15),
(1, 'Mouse Logitech M720', 'Mouse inalámbrico Logitech M720 Triathlon', 250.00, 50),
(1, 'Teclado Mecánico RGB', 'Teclado mecánico gaming con iluminación RGB', 450.00, 30),
(2, 'Camiseta Polo', 'Camiseta polo 100% algodón', 120.00, 100),
(2, 'Jeans Slim Fit', 'Jeans de mezclilla slim fit', 280.00, 75),
(3, 'Lámpara de Mesa LED', 'Lámpara de mesa LED regulable', 150.00, 40),
(3, 'Juego de Sábanas', 'Juego de sábanas matrimonial 100% algodón', 320.00, 60),
(4, 'Pelota de Fútbol', 'Pelota de fútbol profesional tamaño 5', 180.00, 45),
(4, 'Pesas Ajustables 20kg', 'Juego de pesas ajustables hasta 20kg', 550.00, 20),
(4, 'Tapete de Yoga', 'Tapete de yoga antideslizante 6mm', 95.00, 80);
GO

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. fecha_agregado en carrito_item: Tiene DEFAULT CURRENT_TIMESTAMP para registrar cuándo se agregó cada producto
-- 2. fecha_pedido en pedido: Tiene DEFAULT CURRENT_TIMESTAMP para registrar cuándo se creó el pedido
-- 3. Cada usuario debe tener UN carrito activo desde su registro (esta_activo = 1)
-- 4. El carrito se reutiliza: se vacía después de cada compra pero no se elimina
-- 5. Los precios en producto y detalle_pedido son DECIMAL(18,2) para precisión monetaria
-- 6. El stock se decrementa automáticamente al crear un pedido
-- 7. Las contraseñas DEBEN ser hasheadas con bcrypt (mínimo 10 rounds)

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
SELECT '✅ Schema de base de datos creado exitosamente' AS Mensaje;
SELECT '📊 Tablas creadas: 7 (usuario, categoria, producto, carrito, carrito_item, pedido, detalle_pedido)' AS Resumen;
SELECT '🔐 Recuerda: Hashear contraseñas con bcrypt antes de insertar usuarios' AS Recordatorio;
SELECT '🛒 Cada usuario debe tener un carrito activo desde el registro' AS Importante;


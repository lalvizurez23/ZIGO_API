import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { Categoria } from '../entities/categoria.entity';
import { Producto } from '../entities/producto.entity';

export async function seedInitialData(dataSource: DataSource) {
  console.log('Iniciando seeding de datos iniciales...');

  const usuarioRepository = dataSource.getRepository(Usuario);
  const categoriaRepository = dataSource.getRepository(Categoria);
  const productoRepository = dataSource.getRepository(Producto);

  // ============================================
  // 1. CREAR USUARIOS DE PRUEBA
  // ============================================
  console.log('\nCreando usuarios de prueba...');

  const adminPasswordHash = await bcrypt.hash('Admin123', 10);
  const clientePasswordHash = await bcrypt.hash('Usuario123', 10);

  const usuarios = [
    {
      email: 'admin@ecommerce.com',
      password: adminPasswordHash,
      nombre: 'Admin',
      apellido: 'Sistema',
      telefono: '555-0100',
      direccion: 'Calle Principal 123, Ciudad de Guatemala',
      estaActivo: true,
    },
    {
      email: 'usuario@ejemplo.com',
      password: clientePasswordHash,
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '555-0101',
      direccion: 'Zona 10, Ciudad de Guatemala',
      estaActivo: true,
    },
  ];

  for (const usuarioData of usuarios) {
    const existingUsuario = await usuarioRepository.findOne({
      where: { email: usuarioData.email },
    });
    if (!existingUsuario) {
      await usuarioRepository.save(usuarioData);
      console.log(`  Usuario creado: ${usuarioData.email}`);
    } else {
      console.log(`  Usuario ya existe: ${usuarioData.email}`);
    }
  }

  // ============================================
  // 2. CREAR CATEGORÍAS
  // ============================================
  console.log('\nCreando categorías...');

  const categorias = [
    {
      nombre: 'Electrónica',
      descripcion: 'Productos electrónicos y tecnología',
      imagenUrl: 'https://via.placeholder.com/300x200?text=Electronica',
      estaActivo: true,
    },
    {
      nombre: 'Ropa',
      descripcion: 'Ropa y accesorios',
      imagenUrl: 'https://via.placeholder.com/300x200?text=Ropa',
      estaActivo: true,
    },
    {
      nombre: 'Hogar',
      descripcion: 'Artículos para el hogar',
      imagenUrl: 'https://via.placeholder.com/300x200?text=Hogar',
      estaActivo: true,
    },
    {
      nombre: 'Deportes',
      descripcion: 'Artículos deportivos',
      imagenUrl: 'https://via.placeholder.com/300x200?text=Deportes',
      estaActivo: true,
    },
  ];

  const categoriasCreadas = [];
  for (const categoriaData of categorias) {
    const existingCategoria = await categoriaRepository.findOne({
      where: { nombre: categoriaData.nombre },
    });
    if (!existingCategoria) {
      const categoria = await categoriaRepository.save(categoriaData);
      categoriasCreadas.push(categoria);
      console.log(`  Categoría creada: ${categoriaData.nombre}`);
    } else {
      categoriasCreadas.push(existingCategoria);
      console.log(`  Categoría ya existe: ${categoriaData.nombre}`);
    }
  }

  // ============================================
  // 3. CREAR PRODUCTOS
  // ============================================
  console.log('\nCreando productos...');

  const productos = [
    // Electrónica
    {
      idCategoria: categoriasCreadas[0].idCategoria,
      nombre: 'Laptop HP 15-dy2021la',
      descripcion: 'Laptop HP con procesador Intel Core i5, 8GB RAM, 256GB SSD',
      precio: 3500.00,
      stock: 15,
      imagenUrl: 'https://via.placeholder.com/400x300?text=Laptop+HP',
      estaActivo: true,
    },
    {
      idCategoria: categoriasCreadas[0].idCategoria,
      nombre: 'Mouse Logitech M720',
      descripcion: 'Mouse inalámbrico Logitech M720 Triathlon',
      precio: 250.00,
      stock: 50,
      imagenUrl: 'https://via.placeholder.com/400x300?text=Mouse',
      estaActivo: true,
    },
    {
      idCategoria: categoriasCreadas[0].idCategoria,
      nombre: 'Teclado Mecánico RGB',
      descripcion: 'Teclado mecánico gaming con iluminación RGB',
      precio: 450.00,
      stock: 30,
      imagenUrl: 'https://via.placeholder.com/400x300?text=Teclado',
      estaActivo: true,
    },
    // Ropa
    {
      idCategoria: categoriasCreadas[1].idCategoria,
      nombre: 'Camiseta Polo',
      descripcion: 'Camiseta polo 100% algodón',
      precio: 120.00,
      stock: 100,
      imagenUrl: 'https://via.placeholder.com/400x300?text=Polo',
      estaActivo: true,
    },
    {
      idCategoria: categoriasCreadas[1].idCategoria,
      nombre: 'Jeans Slim Fit',
      descripcion: 'Jeans de mezclilla slim fit',
      precio: 280.00,
      stock: 75,
      imagenUrl: 'https://via.placeholder.com/400x300?text=Jeans',
      estaActivo: true,
    },
    // Hogar
    {
      idCategoria: categoriasCreadas[2].idCategoria,
      nombre: 'Lámpara de Mesa LED',
      descripcion: 'Lámpara de mesa LED regulable',
      precio: 150.00,
      stock: 40,
      imagenUrl: 'https://via.placeholder.com/400x300?text=Lampara',
      estaActivo: true,
    },
    {
      idCategoria: categoriasCreadas[2].idCategoria,
      nombre: 'Juego de Sábanas',
      descripcion: 'Juego de sábanas matrimonial 100% algodón',
      precio: 320.00,
      stock: 60,
      imagenUrl: 'https://via.placeholder.com/400x300?text=Sabanas',
      estaActivo: true,
    },
    // Deportes
    {
      idCategoria: categoriasCreadas[3].idCategoria,
      nombre: 'Pelota de Fútbol',
      descripcion: 'Pelota de fútbol profesional tamaño 5',
      precio: 180.00,
      stock: 45,
      imagenUrl: 'https://via.placeholder.com/400x300?text=Futbol',
      estaActivo: true,
    },
    {
      idCategoria: categoriasCreadas[3].idCategoria,
      nombre: 'Pesas Ajustables 20kg',
      descripcion: 'Juego de pesas ajustables hasta 20kg',
      precio: 550.00,
      stock: 20,
      imagenUrl: 'https://via.placeholder.com/400x300?text=Pesas',
      estaActivo: true,
    },
    {
      idCategoria: categoriasCreadas[3].idCategoria,
      nombre: 'Tapete de Yoga',
      descripcion: 'Tapete de yoga antideslizante 6mm',
      precio: 95.00,
      stock: 80,
      imagenUrl: 'https://via.placeholder.com/400x300?text=Yoga',
      estaActivo: true,
    },
  ];

  for (const productoData of productos) {
    const existingProducto = await productoRepository.findOne({
      where: { nombre: productoData.nombre },
    });
    if (!existingProducto) {
      await productoRepository.save(productoData);
      console.log(`  Producto creado: ${productoData.nombre}`);
    } else {
      console.log(`  Producto ya existe: ${productoData.nombre}`);
    }
  }

  console.log('\nSeeding completado exitosamente!\n');
  console.log('Resumen:');
  console.log(`   - ${usuarios.length} usuarios creados`);
  console.log(`   - ${categorias.length} categorías creadas`);
  console.log(`   - ${productos.length} productos creados`);
  console.log('\nCredenciales de acceso:');
  console.log('   Admin - Email: admin@ecommerce.com | Password: Admin123');
  console.log('   Cliente - Email: usuario@ejemplo.com | Password: Usuario123\n');
}

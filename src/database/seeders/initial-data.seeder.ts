import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Rol } from '../entities/rol.entity';
import { Permiso } from '../entities/permiso.entity';
import { RolPermiso } from '../entities/rol-permiso.entity';
import { Usuario } from '../entities/usuario.entity';
import { UsuarioRol } from '../entities/usuario-rol.entity';

export async function seedInitialData(dataSource: DataSource) {
  console.log('🌱 Iniciando seeding de datos iniciales...');

  const rolRepository = dataSource.getRepository(Rol);
  const permisoRepository = dataSource.getRepository(Permiso);
  const rolPermisoRepository = dataSource.getRepository(RolPermiso);
  const usuarioRepository = dataSource.getRepository(Usuario);
  const usuarioRolRepository = dataSource.getRepository(UsuarioRol);

  // ============================================
  // 1. CREAR ROLES
  // ============================================
  console.log('📋 Creando roles...');
  
  const roles = [
    {
      idRol: 1,
      nombre: 'SUPER_ADMIN',
      descripcion: 'Administrador con acceso total al sistema',
      estaActivo: true,
    },
    {
      idRol: 2,
      nombre: 'ADMIN',
      descripcion: 'Administrador con acceso a gestión de productos y órdenes',
      estaActivo: true,
    },
    {
      idRol: 3,
      nombre: 'VENDEDOR',
      descripcion: 'Puede gestionar productos y ver órdenes',
      estaActivo: true,
    },
    {
      idRol: 4,
      nombre: 'CLIENTE',
      descripcion: 'Cliente que puede realizar compras',
      estaActivo: true,
    },
    {
      idRol: 5,
      nombre: 'INVITADO',
      descripcion: 'Usuario sin autenticación (solo visualización)',
      estaActivo: true,
    },
  ];

  for (const rolData of roles) {
    const existingRol = await rolRepository.findOne({
      where: { nombre: rolData.nombre },
    });
    if (!existingRol) {
      await rolRepository.save(rolData);
      console.log(`  ✅ Rol creado: ${rolData.nombre}`);
    } else {
      console.log(`  ⏭️  Rol ya existe: ${rolData.nombre}`);
    }
  }

  // ============================================
  // 2. CREAR PERMISOS
  // ============================================
  console.log('\n🔐 Creando permisos...');

  const permisos = [
    // Permisos de Productos
    { idPermiso: 1, nombre: 'productos.leer', descripcion: 'Ver catálogo de productos', recurso: 'productos', accion: 'leer' },
    { idPermiso: 2, nombre: 'productos.crear', descripcion: 'Crear nuevos productos', recurso: 'productos', accion: 'crear' },
    { idPermiso: 3, nombre: 'productos.actualizar', descripcion: 'Actualizar productos existentes', recurso: 'productos', accion: 'actualizar' },
    { idPermiso: 4, nombre: 'productos.eliminar', descripcion: 'Eliminar productos', recurso: 'productos', accion: 'eliminar' },

    // Permisos de Órdenes
    { idPermiso: 5, nombre: 'ordenes.leer', descripcion: 'Ver órdenes', recurso: 'ordenes', accion: 'leer' },
    { idPermiso: 6, nombre: 'ordenes.crear', descripcion: 'Crear órdenes', recurso: 'ordenes', accion: 'crear' },
    { idPermiso: 7, nombre: 'ordenes.actualizar', descripcion: 'Actualizar estado de órdenes', recurso: 'ordenes', accion: 'actualizar' },
    { idPermiso: 8, nombre: 'ordenes.eliminar', descripcion: 'Eliminar órdenes', recurso: 'ordenes', accion: 'eliminar' },

    // Permisos de Usuarios
    { idPermiso: 9, nombre: 'usuarios.leer', descripcion: 'Ver usuarios del sistema', recurso: 'usuarios', accion: 'leer' },
    { idPermiso: 10, nombre: 'usuarios.crear', descripcion: 'Crear nuevos usuarios', recurso: 'usuarios', accion: 'crear' },
    { idPermiso: 11, nombre: 'usuarios.actualizar', descripcion: 'Actualizar información de usuarios', recurso: 'usuarios', accion: 'actualizar' },
    { idPermiso: 12, nombre: 'usuarios.eliminar', descripcion: 'Eliminar usuarios', recurso: 'usuarios', accion: 'eliminar' },

    // Permisos de Carrito
    { idPermiso: 13, nombre: 'carrito.leer', descripcion: 'Ver carrito de compras', recurso: 'carrito', accion: 'leer' },
    { idPermiso: 14, nombre: 'carrito.crear', descripcion: 'Agregar items al carrito', recurso: 'carrito', accion: 'crear' },
    { idPermiso: 15, nombre: 'carrito.actualizar', descripcion: 'Actualizar cantidades en carrito', recurso: 'carrito', accion: 'actualizar' },
    { idPermiso: 16, nombre: 'carrito.eliminar', descripcion: 'Eliminar items del carrito', recurso: 'carrito', accion: 'eliminar' },

    // Permisos de Reportes
    { idPermiso: 17, nombre: 'reportes.ventas', descripcion: 'Ver reportes de ventas', recurso: 'reportes', accion: 'leer' },
    { idPermiso: 18, nombre: 'reportes.inventario', descripcion: 'Ver reportes de inventario', recurso: 'reportes', accion: 'leer' },

    // Permisos de Configuración
    { idPermiso: 19, nombre: 'configuracion.leer', descripcion: 'Ver configuración del sistema', recurso: 'configuracion', accion: 'leer' },
    { idPermiso: 20, nombre: 'configuracion.actualizar', descripcion: 'Modificar configuración del sistema', recurso: 'configuracion', accion: 'actualizar' },
  ];

  for (const permisoData of permisos) {
    const existingPermiso = await permisoRepository.findOne({
      where: { nombre: permisoData.nombre },
    });
    if (!existingPermiso) {
      await permisoRepository.save(permisoData);
      console.log(`  ✅ Permiso creado: ${permisoData.nombre}`);
    } else {
      console.log(`  ⏭️  Permiso ya existe: ${permisoData.nombre}`);
    }
  }

  // ============================================
  // 3. ASIGNAR PERMISOS A ROLES
  // ============================================
  console.log('\n🔗 Asignando permisos a roles...');

  const rolPermisosData = [
    // ROL: CLIENTE (id_rol = 4)
    { idRol: 4, idPermiso: 1 },  // productos.leer
    { idRol: 4, idPermiso: 5 },  // ordenes.leer
    { idRol: 4, idPermiso: 6 },  // ordenes.crear
    { idRol: 4, idPermiso: 13 }, // carrito.leer
    { idRol: 4, idPermiso: 14 }, // carrito.crear
    { idRol: 4, idPermiso: 15 }, // carrito.actualizar
    { idRol: 4, idPermiso: 16 }, // carrito.eliminar

    // ROL: VENDEDOR (id_rol = 3)
    { idRol: 3, idPermiso: 1 }, { idRol: 3, idPermiso: 2 }, { idRol: 3, idPermiso: 3 }, // productos
    { idRol: 3, idPermiso: 5 }, { idRol: 3, idPermiso: 7 }, // ordenes
    { idRol: 3, idPermiso: 17 }, { idRol: 3, idPermiso: 18 }, // reportes

    // ROL: ADMIN (id_rol = 2)
    { idRol: 2, idPermiso: 1 }, { idRol: 2, idPermiso: 2 }, { idRol: 2, idPermiso: 3 }, { idRol: 2, idPermiso: 4 }, // productos
    { idRol: 2, idPermiso: 5 }, { idRol: 2, idPermiso: 6 }, { idRol: 2, idPermiso: 7 }, { idRol: 2, idPermiso: 8 }, // ordenes
    { idRol: 2, idPermiso: 9 }, { idRol: 2, idPermiso: 11 }, // usuarios
    { idRol: 2, idPermiso: 17 }, { idRol: 2, idPermiso: 18 }, // reportes
    { idRol: 2, idPermiso: 19 }, // configuracion

    // ROL: INVITADO (id_rol = 5)
    { idRol: 5, idPermiso: 1 }, // productos.leer
  ];

  // ROL: SUPER_ADMIN (id_rol = 1) - TODOS los permisos
  for (let i = 1; i <= 20; i++) {
    rolPermisosData.push({ idRol: 1, idPermiso: i });
  }

  for (const rpData of rolPermisosData) {
    const existing = await rolPermisoRepository.findOne({
      where: { idRol: rpData.idRol, idPermiso: rpData.idPermiso },
    });
    if (!existing) {
      await rolPermisoRepository.save(rpData);
    }
  }
  console.log(`  ✅ ${rolPermisosData.length} permisos asignados a roles`);

  // ============================================
  // 4. CREAR USUARIOS DE PRUEBA
  // ============================================
  console.log('\n👤 Creando usuarios de prueba...');

  const passwordHash = await bcrypt.hash('Admin123', 10);

  const usuarios = [
    {
      idUsuario: 1,
      email: 'admin@ecommerce.com',
      passwordEncryptado: passwordHash,
      nombre: 'Admin',
      apellido: 'Sistema',
      estaActivo: true,
    },
    {
      idUsuario: 2,
      email: 'vendedor@ecommerce.com',
      passwordEncryptado: passwordHash,
      nombre: 'Luis',
      apellido: 'Vendedor',
      estaActivo: true,
    },
    {
      idUsuario: 3,
      email: 'clienteprueba@gmail.com',
      passwordEncryptado: passwordHash,
      nombre: 'Maria',
      apellido: 'Cliente',
      estaActivo: true,
    },
  ];

  for (const usuarioData of usuarios) {
    const existingUsuario = await usuarioRepository.findOne({
      where: { email: usuarioData.email },
    });
    if (!existingUsuario) {
      await usuarioRepository.save(usuarioData);
      console.log(`  ✅ Usuario creado: ${usuarioData.email} (Password: Admin123!)`);
    } else {
      console.log(`  ⏭️  Usuario ya existe: ${usuarioData.email}`);
    }
  }

  // ============================================
  // 5. ASIGNAR ROLES A USUARIOS
  // ============================================
  console.log('\n🔗 Asignando roles a usuarios...');

  const usuarioRolesData = [
    { idUsuario: 1, idRol: 1 }, // Admin -> SUPER_ADMIN
    { idUsuario: 2, idRol: 3 }, // Vendedor -> VENDEDOR
    { idUsuario: 3, idRol: 4 }, // Cliente -> CLIENTE
  ];

  for (const urData of usuarioRolesData) {
    const existing = await usuarioRolRepository.findOne({
      where: { idUsuario: urData.idUsuario, idRol: urData.idRol },
    });
    if (!existing) {
      await usuarioRolRepository.save(urData);
    }
  }
  console.log(`  ✅ ${usuarioRolesData.length} roles asignados a usuarios`);

  console.log('\n✅ ¡Seeding completado exitosamente!\n');
  console.log('📊 Resumen:');
  console.log(`   - ${roles.length} roles creados`);
  console.log(`   - ${permisos.length} permisos creados`);
  console.log(`   - ${usuarios.length} usuarios de prueba creados`);
  console.log('\n🔑 Credenciales de acceso:');
  console.log('   Email: admin@ecommerce.com');
  console.log('   Email: vendedor@ecommerce.com');
  console.log('   Email: clienteprueba@gmail.com');
  console.log('   Password (todos): Admin123!\n');
}


import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CarritoService } from '../../src/modules/controllers/Carrito/carrito.service';
import { Carrito } from '../../src/database/entities/carrito.entity';
import { CarritoItem } from '../../src/database/entities/carrito-item.entity';
import { Producto } from '../../src/database/entities/producto.entity';
import { Usuario } from '../../src/database/entities/usuario.entity';

describe('CarritoService', () => {
  let service: CarritoService;
  let carritoRepository: Repository<Carrito>;
  let carritoItemRepository: Repository<CarritoItem>;
  let productoRepository: Repository<Producto>;
  let usuarioRepository: Repository<Usuario>;

  const mockCarritoRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCarritoItemRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    })),
  };

  const mockProductoRepository = {
    findOne: jest.fn(),
  };

  const mockUsuarioRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarritoService,
        {
          provide: getRepositoryToken(Carrito),
          useValue: mockCarritoRepository,
        },
        {
          provide: getRepositoryToken(CarritoItem),
          useValue: mockCarritoItemRepository,
        },
        {
          provide: getRepositoryToken(Producto),
          useValue: mockProductoRepository,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<CarritoService>(CarritoService);
    carritoRepository = module.get<Repository<Carrito>>(getRepositoryToken(Carrito));
    carritoItemRepository = module.get<Repository<CarritoItem>>(getRepositoryToken(CarritoItem));
    productoRepository = module.get<Repository<Producto>>(getRepositoryToken(Producto));
    usuarioRepository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUsuario', () => {
    it('debe retornar el carrito activo del usuario', async () => {
      const usuarioId = 1;
      const mockCarrito = {
        idCarrito: 1,
        idUsuario: usuarioId,
        estaActivo: true,
        items: [],
      };

      mockCarritoRepository.findOne.mockResolvedValue(mockCarrito);

      const result = await service.findByUsuario(usuarioId);

      expect(mockCarritoRepository.findOne).toHaveBeenCalledWith({
        where: { idUsuario: usuarioId, estaActivo: true },
        relations: ['usuario', 'items', 'items.producto'],
      });
      expect(result).toEqual(mockCarrito);
    });

    it('debe retornar null si no existe carrito activo', async () => {
      const usuarioId = 1;

      mockCarritoRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUsuario(usuarioId);
      
      expect(result).toBeNull();
    });
  });

  describe('addItemToCart', () => {
    it('debe agregar un nuevo item al carrito', async () => {
      const cartId = 1;
      const productoId = 1;
      const cantidad = 2;

      const mockCarrito = {
        idCarrito: cartId,
        idUsuario: 1,
        estaActivo: true,
        items: [],
      };

      const mockProducto = {
        idProducto: productoId,
        nombre: 'Producto Test',
        precio: 100,
        stock: 10,
        estaActivo: true,
      };

      const mockCarritoItem = {
        idCarritoItem: 1,
        idCarrito: cartId,
        idProducto: productoId,
        cantidad: cantidad,
      };

      mockCarritoRepository.findOne.mockResolvedValue(mockCarrito);
      mockProductoRepository.findOne.mockResolvedValue(mockProducto);
      mockCarritoItemRepository.findOne.mockResolvedValue(null);
      mockCarritoItemRepository.create.mockReturnValue(mockCarritoItem);
      mockCarritoItemRepository.save.mockResolvedValue(mockCarritoItem);

      const result = await service.addItemToCart(cartId, productoId, cantidad);

      expect(mockCarritoRepository.findOne).toHaveBeenCalledWith({
        where: { idCarrito: cartId },
        relations: ['usuario', 'items', 'items.producto'],
      });
      expect(mockProductoRepository.findOne).toHaveBeenCalledWith({
        where: { idProducto: productoId },
      });
      expect(mockCarritoItemRepository.findOne).toHaveBeenCalledWith({
        where: { idCarrito: cartId, idProducto: productoId },
      });
      expect(mockCarritoItemRepository.create).toHaveBeenCalled();
      expect(mockCarritoItemRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCarrito);
    });

    it('debe actualizar cantidad si el item ya existe en el carrito', async () => {
      const cartId = 1;
      const productoId = 1;
      const cantidad = 2;

      const mockCarrito = {
        idCarrito: cartId,
        idUsuario: 1,
        estaActivo: true,
        items: [],
      };

      const mockProducto = {
        idProducto: productoId,
        nombre: 'Producto Test',
        precio: 100,
        stock: 10,
        estaActivo: true,
      };

      const existingItem = {
        idCarritoItem: 1,
        idCarrito: cartId,
        idProducto: productoId,
        cantidad: 1,
      };

      mockCarritoRepository.findOne.mockResolvedValue(mockCarrito);
      mockProductoRepository.findOne.mockResolvedValue(mockProducto);
      mockCarritoItemRepository.findOne.mockResolvedValue(existingItem);
      mockCarritoItemRepository.save.mockResolvedValue({ ...existingItem, cantidad: 3 });

      await service.addItemToCart(cartId, productoId, cantidad);

      expect(mockCarritoItemRepository.save).toHaveBeenCalledWith({
        ...existingItem,
        cantidad: 3,
      });
    });

    it('debe lanzar BadRequestException si el producto no existe', async () => {
      const cartId = 1;
      const productoId = 999;
      const cantidad = 2;

      const mockCarrito = {
        idCarrito: cartId,
        idUsuario: 1,
        estaActivo: true,
        items: [],
      };

      mockCarritoRepository.findOne.mockResolvedValue(mockCarrito);
      mockProductoRepository.findOne.mockResolvedValue(null);

      await expect(service.addItemToCart(cartId, productoId, cantidad)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si no hay stock suficiente', async () => {
      const cartId = 1;
      const productoId = 1;
      const cantidad = 20;

      const mockCarrito = {
        idCarrito: cartId,
        idUsuario: 1,
        estaActivo: true,
        items: [],
      };

      const mockProducto = {
        idProducto: productoId,
        nombre: 'Producto Test',
        precio: 100,
        stock: 5,
        estaActivo: true,
      };

      mockCarritoRepository.findOne.mockResolvedValue(mockCarrito);
      mockProductoRepository.findOne.mockResolvedValue(mockProducto);
      mockCarritoItemRepository.findOne.mockResolvedValue(null);

      await expect(service.addItemToCart(cartId, productoId, cantidad)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeItemFromCart', () => {
    it('debe eliminar un item del carrito', async () => {
      const usuarioId = 1;
      const itemId = 1;

      const mockCarrito = {
        idCarrito: 1,
        idUsuario: usuarioId,
        estaActivo: true,
        items: [],
      };

      const mockItem = {
        idCarritoItem: itemId,
        idCarrito: mockCarrito.idCarrito,
        carrito: mockCarrito,
      };

      mockCarritoItemRepository.findOne.mockResolvedValue(mockItem);
      mockCarritoItemRepository.remove.mockResolvedValue(mockItem);
      mockCarritoRepository.findOne.mockResolvedValue(mockCarrito);

      const result = await service.removeItemFromCart(usuarioId, itemId);

      expect(mockCarritoItemRepository.findOne).toHaveBeenCalledWith({
        where: { idCarritoItem: itemId, idCarrito: mockCarrito.idCarrito },
      });
      expect(mockCarritoItemRepository.remove).toHaveBeenCalledWith(mockItem);
      expect(result).toEqual(mockCarrito);
    });

    it('debe lanzar NotFoundException si el item no existe', async () => {
      const usuarioId = 1;
      const itemId = 999;

      mockCarritoItemRepository.findOne.mockResolvedValue(null);

      await expect(service.removeItemFromCart(usuarioId, itemId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('clearUserCart', () => {
    it('debe vaciar el carrito del usuario', async () => {
      const usuarioId = 1;

      const mockCarrito = {
        idCarrito: 1,
        idUsuario: usuarioId,
        estaActivo: true,
        items: [{ idCarritoItem: 1 }, { idCarritoItem: 2 }],
      };

      mockCarritoRepository.findOne.mockResolvedValue(mockCarrito);

      const result = await service.clearUserCart(usuarioId);

      expect(mockCarritoRepository.findOne).toHaveBeenCalled();
      expect(mockCarritoItemRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(mockCarrito);
    });

    it('debe lanzar NotFoundException si no existe carrito activo', async () => {
      const usuarioId = 1;

      mockCarritoRepository.findOne.mockResolvedValue(null);

      await expect(service.clearUserCart(usuarioId)).rejects.toThrow(NotFoundException);
    });
  });
});

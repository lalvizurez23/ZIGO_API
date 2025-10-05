import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PedidoService } from '../../src/modules/controllers/Pedido/pedido.service';
import { Pedido } from '../../src/database/entities/pedido.entity';
import { DetallePedido } from '../../src/database/entities/detalle-pedido.entity';
import { Carrito } from '../../src/database/entities/carrito.entity';
import { CarritoItem } from '../../src/database/entities/carrito-item.entity';
import { Producto } from '../../src/database/entities/producto.entity';
import { Usuario } from '../../src/database/entities/usuario.entity';

describe('PedidoService', () => {
  let service: PedidoService;
  let pedidoRepository: Repository<Pedido>;
  let usuarioRepository: Repository<Usuario>;
  let detallePedidoRepository: Repository<DetallePedido>;
  let carritoRepository: Repository<Carrito>;
  let carritoItemRepository: Repository<CarritoItem>;
  let productoRepository: Repository<Producto>;
  let dataSource: DataSource;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      decrement: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  const mockPedidoRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDetallePedidoRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCarritoRepository = {
    findOne: jest.fn(),
  };

  const mockCarritoItemRepository = {
    delete: jest.fn(),
  };

  const mockProductoRepository = {
    findOne: jest.fn(),
    decrement: jest.fn(),
  };

  const mockUsuarioRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoService,
        {
          provide: getRepositoryToken(Pedido),
          useValue: mockPedidoRepository,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
        {
          provide: getRepositoryToken(DetallePedido),
          useValue: mockDetallePedidoRepository,
        },
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
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<PedidoService>(PedidoService);
    pedidoRepository = module.get<Repository<Pedido>>(getRepositoryToken(Pedido));
    usuarioRepository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    detallePedidoRepository = module.get<Repository<DetallePedido>>(
      getRepositoryToken(DetallePedido),
    );
    carritoRepository = module.get<Repository<Carrito>>(getRepositoryToken(Carrito));
    carritoItemRepository = module.get<Repository<CarritoItem>>(getRepositoryToken(CarritoItem));
    productoRepository = module.get<Repository<Producto>>(getRepositoryToken(Producto));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkout', () => {
    it('debe procesar el checkout exitosamente', async () => {
      const usuarioId = 1;
      const datosCheckout = {
        direccionEnvio: 'Test Address',
        numeroTarjeta: '1234567890123456',
        nombreTarjeta: 'TEST USER',
        fechaExpiracion: '12/25',
        cvv: '123',
      };

      const mockCarrito = {
        idCarrito: 1,
        idUsuario: usuarioId,
        estaActivo: true,
        items: [
          {
            idCarritoItem: 1,
            idProducto: 1,
            cantidad: 2,
            producto: {
              idProducto: 1,
              nombre: 'Producto 1',
              precio: 100,
              stock: 10,
            },
          },
          {
            idCarritoItem: 2,
            idProducto: 2,
            cantidad: 1,
            producto: {
              idProducto: 2,
              nombre: 'Producto 2',
              precio: 50,
              stock: 5,
            },
          },
        ],
      };

      const mockPedido = {
        idPedido: 1,
        idUsuario: usuarioId,
        numeroPedido: 'PED-2025-0001',
        total: 250,
        estado: 'pendiente',
        direccionEnvio: datosCheckout.direccionEnvio,
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(mockCarrito);
      mockQueryRunner.manager.create.mockImplementation((entity, data) => data);
      mockQueryRunner.manager.save
        .mockResolvedValueOnce(mockPedido)
        .mockResolvedValue({ idDetallePedido: 1 });
      mockQueryRunner.manager.delete.mockResolvedValue({ affected: 2 });
      mockPedidoRepository.findOne.mockResolvedValue({
        ...mockPedido,
        detalles: [],
      });

      const result = await service.checkout(usuarioId, datosCheckout);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.findOne).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toHaveProperty('idPedido');
    });

    it('debe lanzar BadRequestException si el carrito está vacío', async () => {
      const usuarioId = 1;
      const datosCheckout = {
        direccionEnvio: 'Test Address',
        numeroTarjeta: '1234567890123456',
        nombreTarjeta: 'TEST USER',
        fechaExpiracion: '12/25',
        cvv: '123',
      };

      const mockCarrito = {
        idCarrito: 1,
        idUsuario: usuarioId,
        estaActivo: true,
        items: [],
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(mockCarrito);

      await expect(service.checkout(usuarioId, datosCheckout)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si no hay stock suficiente', async () => {
      const usuarioId = 1;
      const datosCheckout = {
        direccionEnvio: 'Test Address',
        numeroTarjeta: '1234567890123456',
        nombreTarjeta: 'TEST USER',
        fechaExpiracion: '12/25',
        cvv: '123',
      };

      const mockCarrito = {
        idCarrito: 1,
        idUsuario: usuarioId,
        estaActivo: true,
        items: [
          {
            idCarritoItem: 1,
            idProducto: 1,
            cantidad: 20,
            producto: {
              idProducto: 1,
              nombre: 'Producto 1',
              precio: 100,
              stock: 5,
            },
          },
        ],
      };

      const mockProducto = {
        idProducto: 1,
        nombre: 'Producto 1',
        precio: 100,
        stock: 5,
        estaActivo: true,
      };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockCarrito)
        .mockResolvedValueOnce(mockProducto);
      mockQueryRunner.manager.create.mockImplementation((entity, data) => data);

      await expect(service.checkout(usuarioId, datosCheckout)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('debe hacer rollback en caso de error', async () => {
      const usuarioId = 1;
      const datosCheckout = {
        direccionEnvio: 'Test Address',
        numeroTarjeta: '1234567890123456',
        nombreTarjeta: 'TEST USER',
        fechaExpiracion: '12/25',
        cvv: '123',
      };

      mockQueryRunner.manager.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.checkout(usuarioId, datosCheckout)).rejects.toThrow();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findByUsuario', () => {
    it('debe retornar los pedidos del usuario', async () => {
      const usuarioId = 1;
      const mockPedidos = [
        {
          idPedido: 1,
          idUsuario: usuarioId,
          numeroPedido: 'PED-2025-0001',
          total: 250,
          estado: 'completado',
          detalles: [],
        },
        {
          idPedido: 2,
          idUsuario: usuarioId,
          numeroPedido: 'PED-2025-0002',
          total: 150,
          estado: 'pendiente',
          detalles: [],
        },
      ];

      mockPedidoRepository.find.mockResolvedValue(mockPedidos);

      const result = await service.findByUsuario(usuarioId);

      expect(mockPedidoRepository.find).toHaveBeenCalledWith({
        where: { idUsuario: usuarioId },
        relations: ['usuario', 'detalles', 'detalles.producto'],
        order: { fechaPedido: 'DESC' },
      });
      expect(result).toEqual(mockPedidos);
      expect(result).toHaveLength(2);
    });

    it('debe retornar array vacío si no hay pedidos', async () => {
      const usuarioId = 1;

      mockPedidoRepository.find.mockResolvedValue([]);

      const result = await service.findByUsuario(usuarioId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('debe retornar un pedido por ID', async () => {
      const pedidoId = 1;
      const mockPedido = {
        idPedido: pedidoId,
        idUsuario: 1,
        numeroPedido: 'PED-2025-0001',
        total: 250,
        estado: 'completado',
        detalles: [],
      };

      mockPedidoRepository.findOne.mockResolvedValue(mockPedido);

      const result = await service.findOne(pedidoId);

      expect(mockPedidoRepository.findOne).toHaveBeenCalledWith({
        where: { idPedido: pedidoId },
        relations: ['usuario', 'detalles', 'detalles.producto'],
      });
      expect(result).toEqual(mockPedido);
    });

    it('debe lanzar NotFoundException si el pedido no existe', async () => {
      const pedidoId = 999;

      mockPedidoRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(pedidoId)).rejects.toThrow(NotFoundException);
    });
  });
});

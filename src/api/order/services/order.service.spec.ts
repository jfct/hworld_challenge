import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { RecordService } from 'src/api/record/services/record.service';
import { CreateOrderRequestDto } from '../dtos/create-order.request.dto';
import { UpdateOrderRequestDto } from '../dtos/update-order.request.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { Order, OrderHydrated } from '../schemas/order.schema';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let model: Model<OrderHydrated>;

  const mockSession = {
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn().mockResolvedValue(undefined),
  };

  const mockOrderModel = {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockConnection = {
    startSession: jest.fn().mockResolvedValue(mockSession),
  };

  const mockRecordService = {
    findByIds: jest.fn(),
    decrementQuantity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
        {
          provide: RecordService,
          useValue: mockRecordService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    model = module.get<Model<OrderHydrated>>(getModelToken(Order.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new order with transaction', async () => {
      const createDto: CreateOrderRequestDto = {
        items: [
          {
            record: '507f1f77bcf86cd799439011' as any,
            quantity: 2,
          },
        ],
      };

      const mockRecords = [
        {
          _id: '507f1f77bcf86cd799439011',
          artist: 'The Beatles',
          album: 'Abbey Road',
          price: 30,
          qty: 10,
        },
      ];

      const mockOrder = {
        _id: '507f1f77bcf86cd799439012',
        items: [
          {
            record: '507f1f77bcf86cd799439011',
            quantity: 2,
            price: 30,
          },
        ],
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439012',
          items: [
            {
              record: '507f1f77bcf86cd799439011',
              quantity: 2,
              price: 30,
            },
          ],
        }),
      };

      mockRecordService.findByIds.mockResolvedValue(mockRecords);
      mockRecordService.decrementQuantity.mockResolvedValue(undefined);
      mockOrderModel.create.mockResolvedValue([mockOrder]);

      const result = await service.create(createDto);

      expect(result._id).toBe('507f1f77bcf86cd799439012');
      expect(mockConnection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockRecordService.findByIds).toHaveBeenCalledWith([
        '507f1f77bcf86cd799439011',
      ]);
      expect(mockRecordService.decrementQuantity).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        2,
        mockSession,
      );
      expect(mockOrderModel.create).toHaveBeenCalledWith(
        [
          {
            items: [
              {
                record: '507f1f77bcf86cd799439011',
                quantity: 2,
                price: 30,
              },
            ],
          },
        ],
        { session: mockSession },
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should throw BadRequestException when records not found', async () => {
      const createDto: CreateOrderRequestDto = {
        items: [
          {
            record: '507f1f77bcf86cd799439011' as any,
            quantity: 2,
          },
        ],
      };

      mockRecordService.findByIds.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRecordService.findByIds).toHaveBeenCalledWith([
        '507f1f77bcf86cd799439011',
      ]);
      expect(mockSession.startTransaction).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing order', async () => {
      const orderId = '507f1f77bcf86cd799439012';
      const updateDto: UpdateOrderRequestDto = {
        status: OrderStatus.SHIPPING,
      };

      const mockUpdated = {
        _id: orderId,
        customerName: 'John Doe',
        status: OrderStatus.SHIPPING,
      };

      const execMock = jest.fn().mockResolvedValue(mockUpdated);
      mockOrderModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: execMock,
        }),
      });

      const result = await service.update(orderId, updateDto);

      expect(result).toEqual(mockUpdated);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: orderId },
        updateDto,
        { new: true, runValidators: true },
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      const orderId = '507f1f77bcf86cd799439012';
      const updateDto: UpdateOrderRequestDto = {
        status: OrderStatus.SHIPPING,
      };

      const execMock = jest.fn().mockResolvedValue(null);
      mockOrderModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: execMock,
        }),
      });

      await expect(service.update(orderId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('should find an order by id', async () => {
      const orderId = '507f1f77bcf86cd799439012';
      const mockOrder = {
        _id: orderId,
        customerName: 'John Doe',
        items: [],
      };

      mockOrderModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await service.findById(orderId);

      expect(result).toEqual(mockOrder);
      expect(model.findById).toHaveBeenCalledWith(orderId);
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const filters = {
        page: 1,
        limit: 10,
        status: OrderStatus.PENDING,
      };

      const mockOrders = [
        {
          _id: '507f1f77bcf86cd799439012',
          customerName: 'John Doe',
          status: OrderStatus.PENDING,
        },
      ];

      const mockChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrders),
      };

      mockOrderModel.find.mockReturnValue(mockChain);
      mockOrderModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll(filters);

      expect(result.results).toEqual(mockOrders);
      expect(result.page).toBe(1);
      expect(result.count).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(model.find).toHaveBeenCalledWith({ status: OrderStatus.PENDING });
      expect(mockChain.skip).toHaveBeenCalledWith(0);
      expect(mockChain.limit).toHaveBeenCalledWith(10);
      expect(model.countDocuments).toHaveBeenCalledWith({
        status: OrderStatus.PENDING,
      });
    });

    it('should handle projection filters', async () => {
      const filters = {
        page: 1,
        limit: 10,
        projection: ['items.record'] as any,
      };

      const mockOrders = [
        {
          _id: '507f1f77bcf86cd799439012',
          customerName: 'John Doe',
        },
      ];

      const mockChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrders),
      };

      mockOrderModel.find.mockReturnValue(mockChain);
      mockOrderModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll(filters);

      expect(result.results).toEqual(mockOrders);
      expect(mockChain.populate).toHaveBeenCalledWith('items.record');
    });
  });
});

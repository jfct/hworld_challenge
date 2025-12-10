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

  // Shared test data
  const testRecordId = '507f1f77bcf86cd799439011';
  const testOrderId = '507f1f77bcf86cd799439012';

  const mockRecordData = {
    _id: testRecordId,
    artist: 'The Beatles',
    album: 'Abbey Road',
    price: 30,
    qty: 10,
  };

  const mockOrderItemData = {
    record: testRecordId,
    quantity: 2,
    price: 30,
  };

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
            record: testRecordId as any,
            quantity: mockOrderItemData.quantity,
          },
        ],
      };

      const mockOrder = {
        _id: testOrderId,
        items: [mockOrderItemData],
        status: OrderStatus.PENDING,
        toObject: jest.fn().mockReturnValue({
          _id: testOrderId,
          items: [mockOrderItemData],
          status: OrderStatus.PENDING,
        }),
      };

      mockRecordService.findByIds.mockResolvedValue([mockRecordData]);
      mockRecordService.decrementQuantity.mockResolvedValue(undefined);
      mockOrderModel.create.mockResolvedValue([mockOrder]);

      const result = await service.create(createDto);

      expect(result._id).toBe(testOrderId);
      expect(mockConnection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockRecordService.findByIds).toHaveBeenCalledWith([testRecordId]);
      expect(mockRecordService.decrementQuantity).toHaveBeenCalledWith(
        testRecordId,
        mockOrderItemData.quantity,
        mockSession,
      );
      expect(mockOrderModel.create).toHaveBeenCalledWith(
        [{ items: [mockOrderItemData] }],
        { session: mockSession },
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should throw BadRequestException when records not found', async () => {
      const createDto: CreateOrderRequestDto = {
        items: [
          {
            record: testRecordId as any,
            quantity: mockOrderItemData.quantity,
          },
        ],
      };

      mockRecordService.findByIds.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRecordService.findByIds).toHaveBeenCalledWith([testRecordId]);
      expect(mockSession.startTransaction).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing order', async () => {
      const updateDto: UpdateOrderRequestDto = {
        status: OrderStatus.SHIPPING,
      };

      const mockUpdated = {
        _id: testOrderId,
        items: [],
        status: OrderStatus.SHIPPING,
      };

      mockOrderModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUpdated),
        }),
      });

      const result = await service.update(testOrderId, updateDto);

      expect(result).toEqual(mockUpdated);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: testOrderId },
        updateDto,
        { new: true, runValidators: true },
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      const updateDto: UpdateOrderRequestDto = {
        status: OrderStatus.SHIPPING,
      };

      mockOrderModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.update(testOrderId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('should find an order by id', async () => {
      const mockOrder = {
        _id: testOrderId,
        items: [],
        status: OrderStatus.PENDING,
      };

      mockOrderModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await service.findById(testOrderId);

      expect(result).toEqual(mockOrder);
      expect(model.findById).toHaveBeenCalledWith(testOrderId);
    });
  });

  describe('findAll', () => {
    const createMockChain = (results: any[]) => {
      const mockChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(results),
      };

      return mockChain;
    };

    const mockBaseOrder = {
      _id: testOrderId,
      items: [],
      status: OrderStatus.PENDING,
    };

    it('should return paginated orders', async () => {
      const filters = {
        page: 1,
        limit: 10,
        status: OrderStatus.PENDING,
      };

      const mockOrders = [mockBaseOrder];
      const mockChain = createMockChain(mockOrders);

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

      const mockOrders = [mockBaseOrder];
      const mockChain = createMockChain(mockOrders);

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

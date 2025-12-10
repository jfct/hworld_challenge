import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderRequestDto } from '../dtos/create-order.request.dto';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { SearchOrderRequestDto } from '../dtos/search-order.request.dto';
import { UpdateOrderRequestDto } from '../dtos/update-order.request.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderService } from '../services/order.service';
import { OrderController } from './order.controller';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order and return the result', async () => {
      const createDto: CreateOrderRequestDto = {
        items: [
          {
            record: '507f1f77bcf86cd799439011',
            quantity: 2,
          },
        ],
      };

      const resultDto: OrderResponseDto = {
        _id: '507f1f77bcf86cd799439011',
        totalPrice: 60,
        status: OrderStatus.PENDING,
        items: [
          {
            record: '507f1f77bcf86cd799439011',
            quantity: 2,
            price: 30,
            totalPrice: 60,
          },
        ],
      };

      mockOrderService.create.mockResolvedValue(resultDto);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(resultDto);
    });
  });

  describe('update', () => {
    it('should update an order and return the result', async () => {
      // Arrange
      const id = 'order-123';
      const updateDto: UpdateOrderRequestDto = {
        /* ... mock properties ... */
      } as any;
      const resultDto: OrderResponseDto = { id, ...updateDto } as any;

      mockOrderService.update.mockResolvedValue(resultDto);

      // Act
      const result = await controller.update(id, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(resultDto);
    });
  });

  describe('findAll', () => {
    it('should return a list of orders based on filters', async () => {
      // Arrange
      const filters: SearchOrderRequestDto = {
        /* ... mock filters ... */
      } as any;
      const resultDto: OrderResponseDto[] = [{ id: '1' }] as any;

      mockOrderService.findAll.mockResolvedValue(resultDto);

      // Act
      const result = await controller.findAll(filters);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(resultDto);
    });
  });

  describe('findById', () => {
    it('should find an order by id', async () => {
      // Arrange
      const id = 'order-123';
      const resultDto: OrderResponseDto = { id } as any;

      mockOrderService.findById.mockResolvedValue(resultDto);

      // Act
      const result = await controller.findById(id);

      // Assert
      expect(service.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(resultDto);
    });
  });
});

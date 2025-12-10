import { Test, TestingModule } from '@nestjs/testing';
import { RecordController } from './record.controller';
import { RecordService } from '../services/record.service';
import { CreateRecordRequestDto } from '../dtos/create-record.request.dto';
import { UpdateRecordRequestDto } from '../dtos/update-record.request.dto';
import { SearchRecordRequestDto } from '../dtos/search-record.request.dto';
import { RecordCategory, RecordFormat } from '../enums/record.enum';
import { Record } from '../schemas/record.schema';
import { SearchRecordResponseDto } from '../dtos/search-record.response.dto';

describe('RecordController', () => {
  let controller: RecordController;
  let service: RecordService;

  const mockRecordService = {
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordController],
      providers: [
        {
          provide: RecordService,
          useValue: mockRecordService,
        },
      ],
    }).compile();

    controller = module.get<RecordController>(RecordController);
    service = module.get<RecordService>(RecordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const createRecordDto: CreateRecordRequestDto = {
        artist: 'The Beatles',
        album: 'Abbey Road',
        price: 30,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
      };

      const expectedRecord = {
        _id: '507f1f77bcf86cd799439011',
        ...createRecordDto,
      } as Record;

      mockRecordService.create.mockResolvedValue(expectedRecord);

      const result = await controller.create(createRecordDto);

      expect(result).toEqual(expectedRecord);
      expect(service.create).toHaveBeenCalledWith(createRecordDto);
    });

    it('should throw error when creation fails', async () => {
      const createRecordDto: CreateRecordRequestDto = {
        artist: 'The Beatles',
        album: 'Abbey Road',
        price: 30,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
      };

      mockRecordService.create.mockRejectedValue(new Error('Database error'));

      await expect(controller.create(createRecordDto)).rejects.toThrow(
        'Database error',
      );
      expect(service.create).toHaveBeenCalledWith(createRecordDto);
    });
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      const recordId = '507f1f77bcf86cd799439011';
      const updateRecordDto: UpdateRecordRequestDto = {
        price: 35,
        qty: 15,
      };

      const expectedRecord = {
        _id: recordId,
        artist: 'The Beatles',
        album: 'Abbey Road',
        price: 35,
        qty: 15,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
      } as Record;

      mockRecordService.update.mockResolvedValue(expectedRecord);

      const result = await controller.update(recordId, updateRecordDto);

      expect(result).toEqual(expectedRecord);
      expect(service.update).toHaveBeenCalledWith(recordId, updateRecordDto);
    });

    it('should throw error when record not found', async () => {
      const recordId = 'nonexistent-id';
      const updateRecordDto: UpdateRecordRequestDto = {
        price: 35,
        qty: 15,
      };

      mockRecordService.update.mockRejectedValue(new Error('Record not found'));

      await expect(
        controller.update(recordId, updateRecordDto),
      ).rejects.toThrow('Record not found');
      expect(service.update).toHaveBeenCalledWith(recordId, updateRecordDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated records with filters', async () => {
      const searchDto: SearchRecordRequestDto = {
        artist: 'Beatles',
        page: 1,
        limit: 10,
      };

      const expectedResponse: SearchRecordResponseDto = {
        results: [
          {
            _id: '507f1f77bcf86cd799439011',
            artist: 'The Beatles',
            album: 'Abbey Road',
            price: 30,
            qty: 10,
            format: RecordFormat.VINYL,
            category: RecordCategory.ROCK,
          },
        ],
        count: 1,
        page: 1,
        totalPages: 1,
      };

      mockRecordService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(searchDto);

      expect(result).toEqual(expectedResponse);
      expect(service.findAll).toHaveBeenCalledWith(searchDto);
    });

    it('should throw error when search fails', async () => {
      const searchDto: SearchRecordRequestDto = {
        artist: 'Beatles',
      };

      mockRecordService.findAll.mockRejectedValue(
        new Error('Internal error filtering records'),
      );

      await expect(controller.findAll(searchDto)).rejects.toThrow(
        'Internal error filtering records',
      );
      expect(service.findAll).toHaveBeenCalledWith(searchDto);
    });
  });
});

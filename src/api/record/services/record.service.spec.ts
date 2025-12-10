import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecordService } from './record.service';
import { Record, RecordHydrated } from '../schemas/record.schema';
import { TracklistSyncService } from 'src/workers/tracklist-sync/tracklist-sync.service';
import { CreateRecordRequestDto } from '../dtos/create-record.request.dto';
import { UpdateRecordRequestDto } from '../dtos/update-record.request.dto';
import { RecordCategory, RecordFormat } from '../enums/record.enum';
import { NotFoundException } from '@nestjs/common';
import { InsufficientQuantityError } from '../errors/insufficient-quantity.error';

describe('RecordService', () => {
  let service: RecordService;
  let model: Model<RecordHydrated>;

  const mockRecordModel = {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockTracklistSyncService = {
    queueSyncJob: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordService,
        {
          provide: getModelToken(Record.name),
          useValue: mockRecordModel,
        },
        {
          provide: TracklistSyncService,
          useValue: mockTracklistSyncService,
        },
      ],
    }).compile();

    service = module.get<RecordService>(RecordService);
    model = module.get<Model<RecordHydrated>>(getModelToken(Record.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const createDto: CreateRecordRequestDto = {
        artist: 'The Beatles',
        album: 'Abbey Road',
        price: 30,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
      };

      const mockRecord = {
        id: '507f1f77bcf86cd799439011',
        toObject: jest
          .fn()
          .mockReturnValue({ _id: '507f1f77bcf86cd799439011', ...createDto }),
      };

      mockRecordModel.create.mockResolvedValue(mockRecord);

      const result = await service.create(createDto);

      expect(result._id).toBe('507f1f77bcf86cd799439011');
      expect(model.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw error when creation fails', async () => {
      const createDto: CreateRecordRequestDto = {
        artist: 'The Beatles',
        album: 'Abbey Road',
        price: 30,
        qty: 10,
        format: RecordFormat.VINYL,
        category: RecordCategory.ROCK,
      };

      mockRecordModel.create.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        'Error creating record',
      );
    });
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      const recordId = '507f1f77bcf86cd799439011';
      const updateDto: UpdateRecordRequestDto = {
        price: 35,
        qty: 15,
      };

      const mockExisting = {
        _id: recordId,
        artist: 'The Beatles',
        album: 'Abbey Road',
        price: 30,
        qty: 10,
        save: jest.fn().mockResolvedValue({
          toObject: jest.fn().mockReturnValue({
            _id: recordId,
            artist: 'The Beatles',
            album: 'Abbey Road',
            price: 35,
            qty: 15,
          }),
        }),
      };

      mockRecordModel.findById.mockResolvedValue(mockExisting);

      const result = await service.update(recordId, updateDto);

      expect(result).toEqual({
        _id: recordId,
        artist: 'The Beatles',
        album: 'Abbey Road',
        price: 35,
        qty: 15,
      });
      expect(model.findById).toHaveBeenCalledWith(recordId);
    });

    it('should throw NotFoundException when record does not exist', async () => {
      const recordId = 'nonexistent-id';
      const updateDto: UpdateRecordRequestDto = {
        price: 35,
      };

      mockRecordModel.findById.mockResolvedValue(null);

      await expect(service.update(recordId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(model.findById).toHaveBeenCalledWith(recordId);
    });
  });

  describe('findById', () => {
    it('should find a record by id', async () => {
      const recordId = '507f1f77bcf86cd799439011';
      const mockRecord = {
        _id: recordId,
        artist: 'The Beatles',
        album: 'Abbey Road',
      };

      const execMock = jest.fn().mockResolvedValue(mockRecord);
      mockRecordModel.findById.mockReturnValue({ exec: execMock });

      const result = await service.findById(recordId);

      expect(result).toEqual(mockRecord);
      expect(model.findById).toHaveBeenCalledWith(recordId);
    });

    it('should return null when record not found', async () => {
      const recordId = 'nonexistent-id';

      const execMock = jest.fn().mockResolvedValue(null);
      mockRecordModel.findById.mockReturnValue({ exec: execMock });

      const result = await service.findById(recordId);

      expect(result).toBeNull();
    });
  });

  describe('decrementQuantity', () => {
    it('should decrement quantity successfully', async () => {
      const recordId = '507f1f77bcf86cd799439011';
      const quantity = 5;
      const mockSession = {} as any;

      const mockRecord = {
        _id: recordId,
        qty: 10,
      };

      const mockUpdated = {
        _id: recordId,
        qty: 5,
      };

      const leanExecMock = jest.fn().mockResolvedValue(mockRecord);
      mockRecordModel.findById.mockReturnValue({
        session: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: leanExecMock,
          }),
        }),
      });

      const updateExecMock = jest.fn().mockResolvedValue(mockUpdated);
      mockRecordModel.findByIdAndUpdate.mockReturnValue({
        exec: updateExecMock,
      });

      await service.decrementQuantity(recordId, quantity, mockSession);

      expect(model.findById).toHaveBeenCalledWith(recordId);
    });

    it('should throw InsufficientQuantityError when quantity is insufficient', async () => {
      const recordId = '507f1f77bcf86cd799439011';
      const quantity = 15;
      const mockSession = {} as any;

      const mockRecord = {
        _id: recordId,
        qty: 10,
      };

      const leanExecMock = jest.fn().mockResolvedValue(mockRecord);
      mockRecordModel.findById.mockReturnValue({
        session: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: leanExecMock,
          }),
        }),
      });

      await expect(
        service.decrementQuantity(recordId, quantity, mockSession),
      ).rejects.toThrow(InsufficientQuantityError);
    });
  });

  describe('findAll', () => {
    it('should return paginated records with filters', async () => {
      const filters = {
        artist: 'Beatles',
        page: 1,
        limit: 10,
      };

      const mockRecords = [
        {
          _id: '507f1f77bcf86cd799439011',
          artist: 'The Beatles',
          album: 'Abbey Road',
          price: 30,
          qty: 10,
          format: RecordFormat.VINYL,
          category: RecordCategory.ROCK,
        },
      ];

      const mockChain = {
        lean: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRecords),
        countDocuments: jest.fn().mockReturnThis(),
      };

      mockChain.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      mockRecordModel.find.mockReturnValue(mockChain);

      const result = await service.findAll(filters);

      expect(result.results).toEqual(mockRecords);
      expect(result.page).toBe(1);
    });

    it('should handle empty results', async () => {
      const filters = {
        artist: 'NonExistent',
      };

      const mockChain = {
        lean: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
        countDocuments: jest.fn().mockReturnThis(),
      };

      mockChain.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      mockRecordModel.find.mockReturnValue(mockChain);

      const result = await service.findAll(filters);

      expect(result.results).toEqual([]);
      expect(result.count).toBe(0);
    });
  });
});

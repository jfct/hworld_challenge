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
    findOneAndUpdate: jest.fn(),
  };

  const mockTracklistSyncService = {
    queueSyncJob: jest.fn(),
  };

  // Shared test data
  const testRecordId = '507f1f77bcf86cd799439011';
  const createRecordDto: CreateRecordRequestDto = {
    artist: 'The Beatles',
    album: 'Abbey Road',
    price: 30,
    qty: 10,
    format: RecordFormat.VINYL,
    category: RecordCategory.ROCK,
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
      const mockRecord = {
        _id: testRecordId,
        ...createRecordDto,
        toObject: jest
          .fn()
          .mockReturnValue({ _id: testRecordId, ...createRecordDto }),
      };

      mockRecordModel.create.mockResolvedValue(mockRecord);

      const result = await service.create(createRecordDto);

      expect(result._id).toBe(testRecordId);
      expect(model.create).toHaveBeenCalledWith(createRecordDto);
    });

    it('should throw error when creation fails', async () => {
      mockRecordModel.create.mockResolvedValue(null);

      await expect(service.create(createRecordDto)).rejects.toThrow(
        'Error creating record',
      );
    });
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      const updateDto: UpdateRecordRequestDto = {
        price: 35,
        qty: 15,
      };

      const updatedRecord = {
        _id: testRecordId,
        ...createRecordDto,
        ...updateDto,
      };

      const mockExisting = {
        _id: testRecordId,
        ...createRecordDto,
        save: jest.fn().mockResolvedValue({
          toObject: jest.fn().mockReturnValue(updatedRecord),
        }),
      };

      mockRecordModel.findById.mockResolvedValue(mockExisting);

      const result = await service.update(testRecordId, updateDto);

      expect(result).toEqual(updatedRecord);
      expect(model.findById).toHaveBeenCalledWith(testRecordId);
    });

    it('should throw NotFoundException when record does not exist', async () => {
      const updateDto: UpdateRecordRequestDto = {
        price: 35,
      };

      mockRecordModel.findById.mockResolvedValue(null);

      await expect(service.update(testRecordId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(model.findById).toHaveBeenCalledWith(testRecordId);
    });
  });

  describe('findById', () => {
    it('should find a record by id', async () => {
      const mockRecord = {
        _id: testRecordId,
        ...createRecordDto,
      };

      mockRecordModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecord),
      });

      const result = await service.findById(testRecordId);

      expect(result).toEqual(mockRecord);
      expect(model.findById).toHaveBeenCalledWith(testRecordId);
    });

    it('should return null when record not found', async () => {
      mockRecordModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('decrementQuantity', () => {
    const mockSession = {} as any;

    it('should decrement quantity successfully', async () => {
      const quantity = 5;
      const mockRecord = {
        _id: testRecordId,
        qty: 10,
      };

      mockRecordModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockRecord, qty: 5 }),
      });

      await service.decrementQuantity(testRecordId, quantity, mockSession);

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: testRecordId, qty: { $gte: quantity } },
        { $inc: { qty: -quantity } },
        { new: true, session: mockSession },
      );
    });

    it('should throw InsufficientQuantityError when quantity is insufficient', async () => {
      const quantity = 15;
      const mockRecord = {
        _id: testRecordId,
        qty: 10,
      };

      // First findOneAndUpdate returns null (insufficient quantity)
      mockRecordModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Then findById is called to check if record exists
      mockRecordModel.findById.mockReturnValue({
        session: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockRecord),
          }),
        }),
      });

      await expect(
        service.decrementQuantity(testRecordId, quantity, mockSession),
      ).rejects.toThrow(InsufficientQuantityError);
    });
  });

  describe('findAll', () => {
    const createMockChain = (results: any[], count: number) => {
      const mockChain = {
        lean: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(results),
        countDocuments: jest.fn().mockReturnThis(),
      };

      mockChain.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(count),
      });

      return mockChain;
    };

    it('should return paginated records with filters', async () => {
      const filters = {
        artist: 'Beatles',
        page: 1,
        limit: 10,
      };

      const mockRecords = [
        {
          _id: testRecordId,
          ...createRecordDto,
        },
      ];

      mockRecordModel.find.mockReturnValue(createMockChain(mockRecords, 1));

      const result = await service.findAll(filters);

      expect(result.results).toEqual(mockRecords);
      expect(result.page).toBe(1);
      expect(result.count).toBe(1);
    });

    it('should handle empty results', async () => {
      const filters = {
        artist: 'NonExistent',
      };

      mockRecordModel.find.mockReturnValue(createMockChain([], 0));

      const result = await service.findAll(filters);

      expect(result.results).toEqual([]);
      expect(result.count).toBe(0);
    });
  });
});

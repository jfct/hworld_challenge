import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { RecordService } from 'src/api/record/services/record.service';
import { TracklistAdapterFactory } from '../../clients/tracklist/adapters/tracklist-adapter.factory';
import { AdapterType } from '../../clients/tracklist/enums/adapter-type.enum';
import { TracklistSyncProcessor } from './tracklist-sync.processor';
import { TracklistSyncJobData } from './tracklist-sync.service';

describe('TracklistSyncProcessor', () => {
  let processor: TracklistSyncProcessor;

  const mockRecordService = {
    findById: jest.fn(),
  };

  const mockAdapter = {
    getRecordTrackList: jest.fn(),
  };

  const mockAdapterFactory = {
    getAdapter: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracklistSyncProcessor,
        {
          provide: RecordService,
          useValue: mockRecordService,
        },
        {
          provide: TracklistAdapterFactory,
          useValue: mockAdapterFactory,
        },
      ],
    }).compile();

    processor = module.get<TracklistSyncProcessor>(TracklistSyncProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('process', () => {
    it('should sync tracks when record has no tracks', async () => {
      const jobData: TracklistSyncJobData = {
        recordId: '507f1f77bcf86cd799439011',
        mbid: 'mbid-123',
        adapterType: AdapterType.HTTP_MUSICBRAINZ,
      };

      const mockJob = {
        data: jobData,
      } as Job<TracklistSyncJobData>;

      const mockRecord = {
        _id: '507f1f77bcf86cd799439011',
        mbid: 'mbid-123',
        tracks: [],
        tracksSyncedAt: undefined,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockTracklistData = {
        trackList: [
          {
            title: 'Track 1',
            length: 180,
            position: 1,
            release_data: '2020-01-01',
          },
          {
            title: 'Track 2',
            length: 200,
            position: 2,
            release_data: '2020-01-01',
          },
        ],
      };

      mockRecordService.findById.mockResolvedValue(mockRecord);
      mockAdapterFactory.getAdapter.mockReturnValue(mockAdapter);
      mockAdapter.getRecordTrackList.mockResolvedValue(mockTracklistData);

      const result = await processor.process(mockJob);

      expect(result.success).toBe(true);
      expect(result.recordId).toBe('507f1f77bcf86cd799439011');
      expect(result.tracksCount).toBe(2);
      expect(mockRecord.save).toHaveBeenCalled();
      expect(mockRecord.tracks).toHaveLength(2);
      expect(mockRecord.tracks[0].title).toBe('Track 1');
      expect(mockRecord.tracksSyncedAt).toBeDefined();
    });

    it('should sync tracks when MBID has changed', async () => {
      const jobData: TracklistSyncJobData = {
        recordId: '507f1f77bcf86cd799439011',
        mbid: 'mbid-new',
        adapterType: AdapterType.HTTP_MUSICBRAINZ,
      };

      const mockJob = {
        data: jobData,
      } as Job<TracklistSyncJobData>;

      const mockRecord = {
        _id: '507f1f77bcf86cd799439011',
        mbid: 'mbid-old',
        tracks: [{ title: 'Old Track' }],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockTracklistData = {
        trackList: [
          {
            title: 'New Track',
            length: 150,
            position: 1,
            release_data: '2021-01-01',
          },
        ],
      };

      mockRecordService.findById.mockResolvedValue(mockRecord);
      mockAdapterFactory.getAdapter.mockReturnValue(mockAdapter);
      mockAdapter.getRecordTrackList.mockResolvedValue(mockTracklistData);

      const result = await processor.process(mockJob);

      expect(result.success).toBe(true);
      expect(mockRecord.mbid).toBe('mbid-new');
      expect(mockRecord.save).toHaveBeenCalled();
    });

    it('should skip syncing when tracks exist and MBID matches', async () => {
      const jobData: TracklistSyncJobData = {
        recordId: '507f1f77bcf86cd799439011',
        mbid: 'mbid-123',
        adapterType: AdapterType.HTTP_MUSICBRAINZ,
      };

      const mockJob = {
        data: jobData,
      } as Job<TracklistSyncJobData>;

      const mockRecord = {
        _id: '507f1f77bcf86cd799439011',
        mbid: 'mbid-123',
        tracks: [{ title: 'Existing Track' }],
        save: jest.fn(),
      };

      mockRecordService.findById.mockResolvedValue(mockRecord);

      const result = await processor.process(mockJob);

      expect(result.success).toBe(true);
      expect(result.tracksCount).toBe(1);
      expect(mockAdapterFactory.getAdapter).not.toHaveBeenCalled();
      expect(mockRecord.save).not.toHaveBeenCalled();
    });

    it('should throw error when record not found', async () => {
      const jobData: TracklistSyncJobData = {
        recordId: '507f1f77bcf86cd799439011',
        mbid: 'mbid-123',
        adapterType: AdapterType.HTTP_MUSICBRAINZ,
      };

      const mockJob = {
        data: jobData,
      } as Job<TracklistSyncJobData>;

      mockRecordService.findById.mockResolvedValue(null);

      await expect(processor.process(mockJob)).rejects.toThrow(
        'Error handling track sync',
      );
    });
  });
});

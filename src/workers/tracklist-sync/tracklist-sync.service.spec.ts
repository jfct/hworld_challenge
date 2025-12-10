import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { AdapterType } from '../../clients/tracklist/enums/adapter-type.enum';
import { TracklistSyncService } from './tracklist-sync.service';

describe('TracklistSyncService', () => {
  let service: TracklistSyncService;
  let queue: Queue;

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracklistSyncService,
        {
          provide: getQueueToken('tracklist-sync'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<TracklistSyncService>(TracklistSyncService);
    queue = module.get<Queue>(getQueueToken('tracklist-sync'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('queueSyncJob', () => {
    it('should queue a sync job and return job id', async () => {
      const recordId = '507f1f77bcf86cd799439011';
      const mbid = 'mbid-123';
      const adapterType = AdapterType.HTTP_MUSICBRAINZ;

      const mockJob = {
        id: 'job-123',
      };

      mockQueue.add.mockResolvedValue(mockJob);

      const result = await service.queueSyncJob(recordId, mbid, adapterType);

      expect(result).toBe('job-123');
      expect(queue.add).toHaveBeenCalledWith('sync-tracks', {
        recordId,
        mbid,
        adapterType,
      });
    });
  });
});

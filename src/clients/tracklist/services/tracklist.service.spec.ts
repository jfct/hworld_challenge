import { Test, TestingModule } from '@nestjs/testing';
import { TracklistAdapterFactory } from '../adapters/tracklist-adapter.factory';
import { AdapterType } from '../enums/adapter-type.enum';
import { TracklistService } from './tracklist.service';

describe('TracklistService', () => {
  let service: TracklistService;
  let adapterFactory: TracklistAdapterFactory;

  const mockAdapter = {
    getRecordTrackList: jest.fn(),
  };

  const mockAdapterFactory = {
    getAdapter: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracklistService,
        {
          provide: TracklistAdapterFactory,
          useValue: mockAdapterFactory,
        },
      ],
    }).compile();

    service = module.get<TracklistService>(TracklistService);
    adapterFactory = module.get<TracklistAdapterFactory>(
      TracklistAdapterFactory,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecord', () => {
    it('should get record tracklist using adapter', async () => {
      const mbid = 'mbid-123';
      const adapterType = AdapterType.HTTP_MUSICBRAINZ;

      const mockTracklistData = {
        trackList: [
          {
            title: 'Track 1',
            length: 180,
            position: 1,
            release_data: '2020-01-01',
          },
        ],
      };

      mockAdapterFactory.getAdapter.mockReturnValue(mockAdapter);
      mockAdapter.getRecordTrackList.mockResolvedValue(mockTracklistData);

      const result = await service.getRecord(mbid, adapterType);

      expect(result).toEqual(mockTracklistData);
      expect(adapterFactory.getAdapter).toHaveBeenCalledWith(adapterType);
      expect(mockAdapter.getRecordTrackList).toHaveBeenCalledWith(mbid);
    });
  });
});

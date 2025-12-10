import { InternalServerErrorException } from '@nestjs/common';
import { parseStringPromise } from 'xml2js';
import { HttpMusicBrainzAdapter } from './http-musicbrainz.adapter';

// Mock xml2js
jest.mock('xml2js', () => ({
  parseStringPromise: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('HttpMusicBrainzAdapter', () => {
  let adapter: HttpMusicBrainzAdapter;

  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      MUSICBRAINZ_API: 'https://musicbrainz.org/ws/2',
      APPLICATION_NAME: 'test-app',
      APPLICATION_VERSION: '1.0.0',
      CONTACT_EMAIL: 'test@example.com',
    };

    adapter = new HttpMusicBrainzAdapter();
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getRecordTrackList', () => {
    it('should fetch and parse tracklist from MusicBrainz API', async () => {
      const mbid = 'mbid-123';
      const mockXmlResponse = `
                <metadata>
                    <release id="${mbid}">
                        <date>2020-01-01</date>
                        <medium-list>
                            <medium>
                                <track-list>
                                    <track position="1" length="180000">
                                        <title>Track 1</title>
                                        <recording>
                                            <title>Track 1</title>
                                        </recording>
                                    </track>
                                    <track position="2" length="200000">
                                        <title>Track 2</title>
                                        <recording>
                                            <title>Track 2</title>
                                        </recording>
                                    </track>
                                </track-list>
                            </medium>
                        </medium-list>
                    </release>
                </metadata>
            `;

      const mockParsedData = {
        metadata: {
          release: {
            id: mbid,
            date: '2020-01-01',
            'medium-list': {
              medium: {
                'track-list': {
                  track: [
                    {
                      position: '1',
                      length: '180000',
                      title: 'Track 1',
                      recording: { title: 'Track 1' },
                    },
                    {
                      position: '2',
                      length: '200000',
                      title: 'Track 2',
                      recording: { title: 'Track 2' },
                    },
                  ],
                },
              },
            },
          },
        },
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockXmlResponse),
      });

      (parseStringPromise as jest.Mock).mockResolvedValue(mockParsedData);

      const result = await adapter.getRecordTrackList(mbid);

      expect(fetch).toHaveBeenCalledWith(
        `https://musicbrainz.org/ws/2/release/${mbid}?inc=recordings`,
        {
          headers: {
            'User-Agent': 'test-app/1.0.0 (test@example.com)',
          },
        },
      );
      expect(result.trackList).toHaveLength(2);
      expect(result.trackList[0].title).toBe('Track 1');
      expect(result.trackList[0].length).toBe(180000);
      expect(result.trackList[0].position).toBe(1);
      expect(result.trackList[0].release_data).toBe('2020-01-01');
    });

    it('should throw error when API response is not ok', async () => {
      const mbid = 'mbid-789';

      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(adapter.getRecordTrackList(mbid)).rejects.toThrow(
        'Failed to fetch tracklist from MusicBrainz',
      );
    });
  });

  describe('searchRelease', () => {
    it('should search for releases and return results', async () => {
      const artist = 'The Beatles';
      const album = 'Abbey Road';
      const format = 'Vinyl';

      const mockXmlResponse = '<xml>search results</xml>';
      const mockParsedData = {
        metadata: {
          'release-list': {
            release: [
              {
                id: 'mbid-1',
                title: 'Abbey Road',
                'ext:score': '100',
                status: 'Official',
                country: 'GB',
                date: '1969-09-26',
                'medium-list': {
                  medium: {
                    format: 'Vinyl',
                    'track-count': '17',
                  },
                },
              },
            ],
          },
        },
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockXmlResponse),
      });

      (parseStringPromise as jest.Mock).mockResolvedValue(mockParsedData);

      const result = await adapter.searchRelease(artist, album, format);

      expect(result).toHaveLength(1);
      expect(result[0].mbid).toBe('mbid-1');
      expect(result[0].title).toBe('Abbey Road');
      expect(result[0].format).toBe('Vinyl');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('artist%3A%22The%20Beatles%22'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.any(String),
          }),
        }),
      );
    });

    it('should throw InternalServerError on error', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        adapter.searchRelease('Artist', 'Album', 'CD'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('sanitizeInput', () => {
    // Since sanitizeInput is private, we test it indirectly through searchRelease
    it('should sanitize input by removing HTML tags', async () => {
      const artist = '<script>alert("xss")</script>The Beatles';
      const album = 'Abbey Road';
      const format = 'Vinyl';

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('<xml></xml>'),
      });

      (parseStringPromise as jest.Mock).mockResolvedValue({
        metadata: {},
      });

      await adapter.searchRelease(artist, album, format);

      const fetchCall = (fetch as jest.Mock).mock.calls[0][0];
      expect(fetchCall).toContain('The%20Beatles');
      expect(fetchCall).not.toContain('%3Cscript%3E');
    });
  });
});

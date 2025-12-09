import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TracklistAdapterFactory } from 'src/clients/tracklist/adapters/tracklist-adapter.factory';
import { AdapterType } from 'src/clients/tracklist/enums/adapter-type.enum';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly tracklistAdapterFactory: TracklistAdapterFactory,
  ) {}

  @Get('/test-mbid/:mbid')
  @ApiOperation({
    summary: 'Test MusicBrainz ID lookup',
    description:
      'Fetches tracklist data directly from MusicBrainz API for testing purposes',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracklist data from MusicBrainz',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid MBID or MusicBrainz API error',
  })
  async testMbidLookup(@Param('mbid') mbid: string) {
    const adapter = this.tracklistAdapterFactory.getAdapter(
      AdapterType.HTTP_MUSICBRAINZ,
    );
    return adapter.getRecordTrackList(mbid);
  }

  @Get('/test-search')
  @ApiOperation({
    summary: 'Test MusicBrainz search',
    description:
      'Searches MusicBrainz for a release by artist and album name, returns all matching releases',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of matching releases with details',
  })
  async testSearch(
    @Query('artist') artist: string,
    @Query('album') album: string,
    @Query('format') format: string,
  ) {
    const adapter = this.tracklistAdapterFactory.getAdapter(
      AdapterType.HTTP_MUSICBRAINZ,
    );
    const results = await adapter.searchRelease(artist, album, format);
    return {
      query: { artist, album, format },
      count: results.length,
      results,
    };
  }
}

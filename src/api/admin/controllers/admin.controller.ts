import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TracklistAdapterFactory } from 'src/clients/tracklist/adapters/tracklist-adapter.factory';
import { AdapterType } from 'src/clients/tracklist/enums/adapter-type.enum';
import { AdminService } from '../services/admin.service';
import { StatsService } from '../services/stats.service';
import { FinancialStatsResponseDto } from '../dtos/financial-stats.response.dto';
import { LowStockResponseDto } from '../dtos/low-stock.response.dto';
import { GenerateBulkOrdersResponseDto } from '../dtos/generate-orders.response.dto';
import { GenerateOrdersQueryDto } from '../dtos/generate-orders-query.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly tracklistAdapterFactory: TracklistAdapterFactory,
    private readonly adminService: AdminService,
    private readonly statsService: StatsService,
  ) {}

  @Get('/tracklist/test-mbid/:mbid')
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

  @Get('/tracklist/test-search')
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

  @Get('/stats/financial')
  @ApiOperation({
    summary: 'Get financial statistics',
    description:
      'Returns revenue and order statistics grouped by status and overall totals',
  })
  @ApiResponse({
    status: 200,
    description: 'Financial statistics',
    type: FinancialStatsResponseDto,
  })
  async getFinancialStats(): Promise<FinancialStatsResponseDto> {
    return this.statsService.getFinancialStats();
  }

  @Get('/stats/low-stock')
  @ApiOperation({
    summary: 'Get low stock records',
    description:
      'Returns records with stock quantity at or below the specified threshold',
  })
  @ApiResponse({
    status: 200,
    description: 'Low stock records',
    type: LowStockResponseDto,
  })
  async getLowStockRecords(
    @Query('threshold') threshold?: number,
  ): Promise<LowStockResponseDto> {
    const records = await this.statsService.getLowStockRecords(threshold || 5);
    return { records };
  }

  // The bulk creation is mostly for testing purposes
  @Post('/orders/generate')
  @ApiOperation({
    summary: 'Generate random orders',
    description:
      'Creates random orders from existing records with random quantities and statuses. Maximum 10,000 orders.',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders generated successfully',
    type: GenerateBulkOrdersResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid count or no records available',
  })
  async generateOrders(
    @Query() query: GenerateOrdersQueryDto,
  ): Promise<GenerateBulkOrdersResponseDto> {
    return this.adminService.generateRandomOrders(query.count);
  }
}

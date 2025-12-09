import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateRecordRequestDto } from '../dtos/create-record.request.dto';
import { RecordResponseDto } from '../dtos/record-response.dto';
import { SearchRecordRequestDto } from '../dtos/search-record.request.dto';
import { SearchRecordResponseDto } from '../dtos/search-record.response.dto';
import { UpdateRecordRequestDto } from '../dtos/update-record.request.dto';
import { Record } from '../schemas/record.schema';
import { RecordService } from '../services/record.service';
import { TracklistAdapterFactory } from 'src/clients/tracklist/adapters/tracklist-adapter.factory';
import { AdapterType } from 'src/clients/tracklist/enums/adapter-type.enum';

@Controller('records')
export class RecordController {
  constructor(
    @Inject(RecordService) private readonly recordService: RecordService,
    private readonly tracklistAdapterFactory: TracklistAdapterFactory,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new record' })
  @ApiBody({
    description: 'Payload describing the items to be ordered.',
    type: CreateRecordRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Record successfully created',
    type: RecordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() request: CreateRecordRequestDto): Promise<Record> {
    return this.recordService.create(request);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing record' })
  @ApiBody({
    description: 'Payload describing the items to be ordered.',
    type: CreateRecordRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Record updated successfully',
    type: RecordResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cannot find record to update' })
  async update(
    @Param('id') id: string,
    @Body() request: UpdateRecordRequestDto,
  ) {
    return this.recordService.update(id, request);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Get all records with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of records',
    type: SearchRecordResponseDto,
  })
  async findAll(@Query() request: SearchRecordRequestDto) {
    return this.recordService.findAll(request);
  }

  // TODO: Remove, testing purposes only
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
}

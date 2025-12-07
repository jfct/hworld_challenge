import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { CreateRecordRequestDto } from '../dtos/create-record.request.dto';
import { SearchRecordRequestDto } from '../dtos/search-record.request.dto';
import { UpdateRecordRequestDto } from '../dtos/update-record.request.dto';
import { Record } from '../schemas/record.schema';
import { RecordService } from '../services/record.service';

@Controller('records')
export class RecordController {
  constructor(
    @InjectModel('Record') private readonly recordModel: Model<Record>,
    @Inject(RecordService) private readonly recordService: RecordService
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new record' })
  @ApiBody({
    description: 'Payload describing the items to be ordered.',
    type: CreateRecordRequestDto,
  })
  @ApiResponse({ status: 201, description: 'Record successfully created', type: Record })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() request: CreateRecordRequestDto): Promise<Record> {
    return this.recordService.create(request);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing record' })
  @ApiBody({
    description: 'Payload describing the items to be ordered.',
    type: CreateRecordRequestDto,
  })
  @ApiResponse({ status: 200, description: 'Record updated successfully', type: Record })
  @ApiResponse({ status: 500, description: 'Cannot find record to update' })
  async update(
    @Param('id') id: string,
    @Body() request: UpdateRecordRequestDto,
  ): Promise<Record> {
    return this.recordService.update(id, request);
  }

  @Get()
  @ApiOperation({ summary: 'Get all records with optional filters' })
  @ApiBody({
    description: 'Filters used to search records',
    type: SearchRecordRequestDto
  })
  @ApiResponse({
    status: 200,
    description: 'List of records',
    type: [Record],
  })
  async findAll(
    @Body() request: SearchRecordRequestDto,
  ): Promise<Record[]> {
    return this.recordService.findAll(request);
  }
}

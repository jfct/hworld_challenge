import {
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../utils/dtos/pagination.dto';
import { RecordCategory, RecordFormat } from '../enums/record.enum';
import { BaseRecordDto } from './base-record.dto';
import { MbidStatus } from '../enums/mbid-status.enum';

export class SearchRecordRequestDto extends IntersectionType(
  PartialType(
    OmitType(BaseRecordDto, [
      'format',
      'category',
      'qty',
      'tracks',
      'tracksSyncedAt',
    ] as const),
  ),
  PaginationDto,
) {
  @ApiPropertyOptional({
    description: 'A general query that can match artist or album',
    type: String,
    example: 'The Beatles',
    required: false,
  })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({
    description: 'Category of the record',
    enum: RecordCategory,
    isArray: true,
    example: [RecordCategory.ROCK],
    required: false,
  })
  @IsEnum(RecordCategory, { each: true })
  @IsOptional()
  category?: RecordCategory[];

  @ApiPropertyOptional({
    description: 'Format of the record',
    enum: RecordFormat,
    isArray: true,
    example: [RecordFormat.VINYL],
    required: false,
  })
  @IsEnum(RecordFormat, { each: true })
  @IsOptional()
  format?: RecordFormat[];

  @ApiPropertyOptional({ description: 'The id of the order', type: String })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({
    description: 'Search by a specific track in the album',
    type: [String],
  })
  @IsArray()
  @IsString()
  tracks?: string[];

  @ApiPropertyOptional({
    description: 'Current status of the MBID',
    enum: MbidStatus,
  })
  @IsEnum(MbidStatus)
  @IsOptional()
  mbidStatus?: MbidStatus;
}

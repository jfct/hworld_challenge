import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { PAGINATION_LIMIT_VALUE } from '../settings/pagination-settings';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Limit',
    default: PAGINATION_LIMIT_VALUE,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Page, based on the limit affects the skip/offset',
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;
}

export class PaginationMetadataDto {
  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Count of total documents' })
  count: number;

  @ApiProperty({ description: 'Current page' })
  page: number;
}

import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/api/utils/dtos/pagination.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderProjection } from '../enums/order-projection.enum';
import { Transform } from 'class-transformer';

export class SearchOrderRequestDto extends IntersectionType(PaginationDto) {
  @ApiPropertyOptional({ description: 'The id of the order' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Filter by order status',
    enum: OrderStatus,
    required: false,
    default: OrderStatus.PENDING,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({
    description: 'Filter by record ID (finds orders containing this record)',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  record?: string;

  @ApiPropertyOptional({
    description: 'List of fields you might want to populate in the order',
    enum: OrderProjection,
    isArray: true,
    required: false,
    example: [OrderProjection.RECORD],
  })
  @Transform(({ value }) =>
    value ? (Array.isArray(value) ? value : [value]) : undefined,
  )
  @IsOptional()
  @IsEnum(OrderProjection, { each: true })
  projection?: OrderProjection[];
}

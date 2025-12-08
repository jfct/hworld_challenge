import { IntersectionType, PartialType } from '@nestjs/swagger';
import { PaginationDto } from 'src/api/utils/dtos/pagination.dto';
import { BaseOrderDto } from './base-order.dto';

export class SearchOrderRequestDto extends IntersectionType(
  PartialType(BaseOrderDto),
  PaginationDto,
) {}

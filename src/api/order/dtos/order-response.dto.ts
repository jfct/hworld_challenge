import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { EntityDto } from 'src/api/utils/dtos/entity.dto';
import { BaseOrderDto } from './base-order.dto';
import { OrderItemResponseDto } from './order-item-response.dto';

export class OrderResponseDto extends IntersectionType(
  OmitType(BaseOrderDto, ['items'] as const),
  EntityDto,
) {
  @ApiProperty({
    description: 'List of items in this order with populated records',
    type: [OrderItemResponseDto],
  })
  items: OrderItemResponseDto[];
}

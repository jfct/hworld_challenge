import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { IOrder } from '../schemas/order.schema';
import { BaseOrderItemDto } from './base-order-item.dto';

export class BaseOrderDto implements IOrder<string> {
  @ApiProperty({
    description: 'List of items in this order',
    type: [BaseOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BaseOrderItemDto)
  items: BaseOrderItemDto[];

  @ApiProperty({ description: 'Current order status', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    description: 'Total price for the entire order (calculated automatically)',
    type: Number,
  })
  totalPrice: number;
}

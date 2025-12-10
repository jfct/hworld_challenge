import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrderRequestDto } from './create-order.request.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { IsEnum } from 'class-validator';

export class UpdateOrderRequestDto extends PartialType(CreateOrderRequestDto) {
  @ApiProperty({ description: 'Current order status', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

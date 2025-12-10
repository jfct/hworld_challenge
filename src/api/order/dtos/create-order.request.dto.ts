import { ApiProperty, OmitType } from '@nestjs/swagger';
import { BaseOrderItemDto } from './base-order-item.dto';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItems extends OmitType(BaseOrderItemDto, ['price']) {}

export class CreateOrderRequestDto {
  @ApiProperty({
    description: 'List of items in this order',
    type: [CreateOrderItems],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItems)
  items: CreateOrderItems[];
}

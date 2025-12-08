import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { IOrderRecordItem } from '../schemas/order-record-item.schema';

export class OrderItemDto implements IOrderRecordItem<string> {
  @ApiProperty({
    description: 'The record id for this item',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  record: string;

  @ApiProperty({ description: 'Quantity of this record', type: Number })
  @IsNumber()
  @Min(1)
  quantity: number;
}

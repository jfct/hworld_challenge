import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from 'src/api/order/enums/order-status.enum';

export class GeneratedOrderDto {
  @ApiProperty({
    description: 'Order ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Number of items in the order',
    example: 3,
  })
  itemCount: number;
}

export class GenerateOrdersResponseDto {
  @ApiProperty({
    description: 'Number of orders created',
    example: 10,
  })
  created: number;

  @ApiProperty({
    description: 'Array of created orders',
    type: [GeneratedOrderDto],
  })
  orders: GeneratedOrderDto[];
}

export class GenerateBulkOrdersResponseDto {
  @ApiProperty({
    description: 'Number of orders created',
    example: 1000,
  })
  created: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Successfully created 1000 random orders',
  })
  message: string;
}

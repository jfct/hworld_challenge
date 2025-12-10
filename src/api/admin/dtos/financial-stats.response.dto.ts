import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from 'src/api/order/enums/order-status.enum';

export class StatusStatsDto {
  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Total revenue for this status',
    example: 1250.5,
  })
  revenue: number;

  @ApiProperty({
    description: 'Number of orders with this status',
    example: 15,
  })
  orderCount: number;

  @ApiProperty({
    description: 'Total items in orders with this status',
    example: 42,
  })
  itemCount: number;
}

export class FinancialStatsResponseDto {
  @ApiProperty({
    description: 'Statistics grouped by order status',
    type: [StatusStatsDto],
  })
  byStatus: StatusStatsDto[];
}

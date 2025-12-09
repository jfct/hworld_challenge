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

export class OverallStatsDto {
  @ApiProperty({
    description: 'Total revenue across all orders',
    example: 5432.75,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Total number of orders',
    example: 87,
  })
  orderCount: number;

  @ApiProperty({
    description: 'Total items sold across all orders',
    example: 234,
  })
  totalItemsSold: number;
}

export class FinancialStatsResponseDto {
  @ApiProperty({
    description: 'Statistics grouped by order status',
    type: [StatusStatsDto],
  })
  byStatus: StatusStatsDto[];

  @ApiProperty({
    description: 'Overall statistics across all orders',
    type: OverallStatsDto,
  })
  overall: OverallStatsDto;
}

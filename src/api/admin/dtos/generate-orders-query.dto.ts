import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class GenerateOrdersQueryDto {
  @ApiProperty({
    description: 'Number of orders to generate',
    minimum: 1,
    maximum: 10000,
    default: 20,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  count: number = 20;
}

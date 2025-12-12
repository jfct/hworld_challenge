import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class GenerateRecordsQueryDto {
  @ApiProperty({
    minimum: 1,
    maximum: 100000,
    default: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  count: number = 100;
}

import { ApiProperty } from '@nestjs/swagger';

export class GenerateRecordsResponseDto {
  @ApiProperty({ type: Number })
  created: number;

  @ApiProperty({ type: String })
  message: string;
}

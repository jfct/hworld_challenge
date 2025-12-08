import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseTrackInfoDto {
  @ApiProperty({ description: 'Title', type: String, required: true })
  title: string;

  @ApiProperty({
    description: 'Length of the track',
    type: Number,
    required: true,
  })
  length: number;

  @ApiProperty({
    description: 'Position of the track',
    type: Number,
    required: true,
  })
  position: number;

  @ApiPropertyOptional({
    description: 'Release date',
    type: String,
    required: false,
  })
  releaseDate?: string;
}

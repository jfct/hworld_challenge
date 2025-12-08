import { ApiProperty } from '@nestjs/swagger';

export class TrackDetailsDto {
  @ApiProperty({ description: 'title of the track', type: String })
  title: string;

  @ApiProperty({ description: 'Length of the track', type: Number })
  length: number;

  @ApiProperty({
    description: 'Position of the track in the Record',
    type: Number,
  })
  position: number;

  @ApiProperty({ description: 'Release date of the track', type: String })
  release_data: string;
}

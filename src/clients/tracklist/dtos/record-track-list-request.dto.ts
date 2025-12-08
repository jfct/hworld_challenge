import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RecordTracklistRequestDto {
  @ApiProperty({
    description: 'The mbid of the record to get the track info form',
  })
  @IsString()
  @IsNotEmpty()
  mbid: string;
}

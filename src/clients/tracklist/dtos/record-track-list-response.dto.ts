import { ApiProperty } from '@nestjs/swagger';
import { TrackDetailsDto } from './track-details.dto';

export class RecordTracklistResponseDto {
  @ApiProperty({
    description: 'The track list from the record that was requested',
    type: [TrackDetailsDto],
  })
  trackList: TrackDetailsDto[];
}

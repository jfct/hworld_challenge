import { RecordTracklistResponseDto } from '../dtos/record-track-list-response.dto';

export interface ITracklistAdapter {
  getRecordTrackList(mbid: string): Promise<RecordTracklistResponseDto>;
}

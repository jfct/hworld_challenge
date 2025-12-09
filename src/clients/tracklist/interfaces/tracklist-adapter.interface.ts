import { RecordTracklistResponseDto } from '../dtos/record-track-list-response.dto';

export interface MusicBrainzStatus {
  _: string;
  id: string;
}

export interface MusicBrainzSearchResult {
  mbid: string;
  title: string;
  score: number;
  status: MusicBrainzStatus;
  country: string;
  date: string;
  format: string;
  trackCount: number;
}

export interface ITracklistAdapter {
  searchRelease(
    artist: string,
    album: string,
    format: string,
  ): Promise<MusicBrainzSearchResult[]>;
  getRecordTrackList(mbid: string): Promise<RecordTracklistResponseDto>;
}

import { Injectable } from '@nestjs/common';
import { RecordTracklistResponseDto } from '../dtos/record-track-list-response.dto';
import { TracklistAdapterFactory } from '../adapters/tracklist-adapter.factory';
import { AdapterType } from '../enums/adapter-type.enum';

@Injectable()
export class TracklistService {
  constructor(private readonly adapterFactory: TracklistAdapterFactory) {}

  async getRecord(
    mbid: string,
    adapterType: AdapterType = AdapterType.HTTP_MUSICBRAINZ,
  ): Promise<RecordTracklistResponseDto> {
    const adapter = this.adapterFactory.getAdapter(adapterType);
    return adapter.getRecordTrackList(mbid);
  }
}

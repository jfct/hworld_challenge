import { Injectable } from '@nestjs/common';
import { ITracklistAdapter } from '../interfaces/tracklist-adapter.interface';
import { MusicBrainzAdapter } from './musicbrainz.adapter';
import { AdapterType } from '../enums/adapter-type.enum';
import { HttpMusicBrainzAdapter } from './http-musicbrainz.adapter';

@Injectable()
export class TracklistAdapterFactory {
  constructor(
    private readonly musicBrainzAdapter: MusicBrainzAdapter,
    private readonly httpMusicBrainzAdapter: HttpMusicBrainzAdapter,
  ) {}

  getAdapter(adapterType: AdapterType): ITracklistAdapter {
    switch (adapterType) {
      case AdapterType.MUSICBRAINZ_CLIENT:
        return this.musicBrainzAdapter;

      case AdapterType.HTTP_MUSICBRAINZ:
        return this.httpMusicBrainzAdapter;

      default:
        return this.httpMusicBrainzAdapter;
    }
  }
}

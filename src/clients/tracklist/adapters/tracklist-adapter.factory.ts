import { Injectable } from '@nestjs/common';
import { ITracklistAdapter } from '../interfaces/tracklist-adapter.interface';
import { MusicBrainzAdapter } from './musicbrainz.adapter';
import { AdapterType } from '../enums/adapter-type.enum';

@Injectable()
export class TracklistAdapterFactory {
  constructor(private readonly musicBrainzAdapter: MusicBrainzAdapter) {}

  getAdapter(adapterType: AdapterType): ITracklistAdapter {
    switch (adapterType) {
      case AdapterType.MUSICBRAINZ:
        return this.musicBrainzAdapter;

      default:
        return this.musicBrainzAdapter;
    }
  }
}

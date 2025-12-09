import { Module } from '@nestjs/common';
import { TracklistService } from './services/tracklist.service';
import { HttpMusicBrainzAdapter } from './adapters/http-musicbrainz.adapter';
import { TracklistAdapterFactory } from './adapters/tracklist-adapter.factory';

@Module({
  imports: [],
  providers: [
    TracklistService,
    HttpMusicBrainzAdapter,
    TracklistAdapterFactory,
  ],
  exports: [TracklistService, TracklistAdapterFactory, HttpMusicBrainzAdapter],
})
export class TrackListModule {}

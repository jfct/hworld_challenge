import { Module } from '@nestjs/common';
import { TracklistService } from './services/tracklist.service';
import { MusicBrainzAdapter } from './adapters/musicbrainz.adapter';
import { HttpMusicBrainzAdapter } from './adapters/http-musicbrainz.adapter';
import { TracklistAdapterFactory } from './adapters/tracklist-adapter.factory';
import { RecordModule } from 'src/api/record/record.module';

@Module({
  imports: [RecordModule],
  providers: [
    TracklistService,
    MusicBrainzAdapter,
    HttpMusicBrainzAdapter,
    TracklistAdapterFactory,
  ],
  exports: [TracklistService, TracklistAdapterFactory],
})
export class TrackListModule {}

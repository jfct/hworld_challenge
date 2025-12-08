import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { env } from 'process';
import { TracklistSyncService } from './tracklist-sync/tracklist-sync.service';
import { TracklistSyncProcessor } from './tracklist-sync/tracklist-sync.processor';
import { TrackListModule } from '../clients/tracklist/tracklist.module';
import { RecordModule } from '../api/record/record.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: env.REDIS_HOST || 'localhost',
        port: parseInt(env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'tracklist-sync',
      // This will be used to "respect" the rate limiter by MusicBrainz API
      // They say 50/s, we can adapt if needed
      limiter: {
        max: 1,
        duration: 1000,
      },
    }),
    TrackListModule,
    RecordModule,
  ],
  providers: [TracklistSyncService, TracklistSyncProcessor],
  exports: [TracklistSyncService],
})
export class WorkersModule {}

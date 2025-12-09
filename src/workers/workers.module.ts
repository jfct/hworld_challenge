import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { env } from 'process';
import { TracklistSyncService } from './tracklist-sync/tracklist-sync.service';
import { TracklistSyncProcessor } from './tracklist-sync/tracklist-sync.processor';
import { TrackListModule } from '../clients/tracklist/tracklist.module';
import { RecordModule } from 'src/api/record/record.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: env.REDIS_HOST || 'localhost',
        port: parseInt(env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'tracklist-sync',
    }),
    forwardRef(() => RecordModule),
    forwardRef(() => TrackListModule),
  ],
  providers: [TracklistSyncService, TracklistSyncProcessor],
  exports: [TracklistSyncService],
})
export class WorkersModule {}

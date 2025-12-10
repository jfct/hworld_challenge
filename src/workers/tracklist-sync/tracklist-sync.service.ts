import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AdapterType } from '../../clients/tracklist/enums/adapter-type.enum';

export interface TracklistSyncJobData {
  recordId: string;
  mbid: string;
  adapterType: AdapterType;
}

@Injectable()
export class TracklistSyncService {
  constructor(
    @InjectQueue('tracklist-sync')
    private syncQueue: Queue<TracklistSyncJobData>,
  ) {}
  private readonly logger = new Logger(TracklistSyncService.name);

  async queueSyncJob(
    recordId: string,
    mbid: string,
    adapterType: AdapterType = AdapterType.HTTP_MUSICBRAINZ,
  ): Promise<string> {
    this.logger.log(
      `${adapterType} - Syncing tracks for ${recordId} (mbid: ${mbid})`,
    );

    const job = await this.syncQueue.add('sync-tracks', {
      recordId,
      mbid,
      adapterType,
    });

    return job.id as string;
  }
}

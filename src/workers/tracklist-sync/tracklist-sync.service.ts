import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
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

  async queueSyncJob(
    recordId: string,
    mbid: string,
    adapterType: AdapterType = AdapterType.HTTP_MUSICBRAINZ,
  ): Promise<string> {
    const job = await this.syncQueue.add('sync-tracks', {
      recordId,
      mbid,
      adapterType,
    });

    return job.id as string;
  }
}

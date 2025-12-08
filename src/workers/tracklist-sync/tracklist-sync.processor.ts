import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { TracklistAdapterFactory } from '../../clients/tracklist/adapters/tracklist-adapter.factory';
import { TracklistSyncJobData } from './tracklist-sync.service';
import { RecordService } from 'src/api/record/services/record.service';

@Processor('tracklist-sync')
@Injectable()
export class TracklistSyncProcessor {
  constructor(
    private readonly recordService: RecordService,
    private readonly adapterFactory: TracklistAdapterFactory,
  ) {}

  @Process('sync-tracks')
  async handleSyncTracks(job: Job<TracklistSyncJobData>) {
    const { recordId, mbid, adapterType } = job.data;

    try {
      const record = await this.recordService.findById(recordId);
      if (!record) {
        throw new Error(`Record ${recordId} not found`);
      }

      // Check if MBID has changed or if tracks were never synced
      if (
        record.mbid !== mbid ||
        !record.tracks ||
        record.tracks.length === 0
      ) {
        const adapter = this.adapterFactory.getAdapter(adapterType);
        const tracklistData = await adapter.getRecordTrackList(mbid);

        record.mbid = mbid;
        record.tracks = tracklistData.trackList.map((track) => ({
          title: track.title,
          length: track.length,
          position: track.position,
          releaseDate: track.release_data,
        }));
        record.tracksSyncedAt = new Date().toISOString();

        await record.save();
      }

      return { success: true, recordId, tracksCount: record.tracks?.length };
    } catch (error) {
      throw new Error('Error handling track sync');
    }
  }
}

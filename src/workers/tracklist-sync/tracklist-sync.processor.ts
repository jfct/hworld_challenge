import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RecordService } from 'src/api/record/services/record.service';
import { MbidStatus } from 'src/api/record/enums/mbid-status.enum';
import { TracklistAdapterFactory } from '../../clients/tracklist/adapters/tracklist-adapter.factory';
import { TracklistSyncJobData } from './tracklist-sync.service';
import { InvalidMbidError } from 'src/api/record/errors/invalid-mbid.error';

// We are rate limiting "hard just because of the challenge, if we wanted we could of increased a bit
// They have a limit of 50 per second
@Processor('tracklist-sync', {
  limiter: {
    max: 1,
    duration: 1000,
  },
})
@Injectable()
export class TracklistSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(TracklistSyncProcessor.name);

  constructor(
    private readonly recordService: RecordService,
    private readonly adapterFactory: TracklistAdapterFactory,
  ) {
    super();
  }

  async process(job: Job<TracklistSyncJobData>) {
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

        try {
          const tracklistData = await adapter.getRecordTrackList(mbid);

          record.mbid = mbid;
          record.mbidStatus = MbidStatus.VALID;
          record.tracks = tracklistData.trackList.map((track) => ({
            title: track.title,
            length: track.length,
            position: track.position,
            releaseDate: track.release_data,
          }));
          record.tracksSyncedAt = new Date().toISOString();

          await record.save();
          this.logger.debug(
            `${adapterType} - completed sync for ${record.album} (mbid: ${mbid}) in record id: ${recordId}`,
          );
        } catch (error) {
          // MBID is invalid or fetch failed
          record.mbid = mbid;
          record.mbidStatus = MbidStatus.INVALID;
          record.tracks = null;
          record.tracksSyncedAt = null;

          await record.save();

          this.logger.warn(
            `${adapterType} - failed to sync tracks for ${record.album} (mbid: ${mbid}) in record id: ${recordId}: ${error.message}`,
          );

          throw new InvalidMbidError(record.id, mbid);
        }
      }

      return { success: true, recordId, tracksCount: record.tracks?.length };
    } catch (error) {
      this.logger.error(
        `Error handling track sync for record ${recordId}: ${error.message}`,
      );
      throw new Error(`Error handling track sync: ${error.message}`);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ITracklistAdapter } from '../interfaces/tracklist-adapter.interface';
import { MusicBrainzApi } from 'musicbrainz-api';
import { env } from 'process';
import { RecordTracklistResponseDto } from '../dtos/record-track-list-response.dto';
import { TrackDetailsDto } from '../dtos/track-details.dto';

/**
 * MusicBrainz implementation of the tracklist adapter
 * Uses the MusicBrainz JS API client that they share
 * Wraps the musicbrainz-api npm package
 */
@Injectable()
export class MusicBrainzAdapter implements ITracklistAdapter {
  private musicBrainzApi: MusicBrainzApi;

  constructor() {
    this.musicBrainzApi = new MusicBrainzApi({
      appName: env.APPLICATION_NAME ?? 'hworld_challenge',
      appVersion: env.APPLICATION_VERSION ?? '0.1.0',
      appContactInfo: env.CONTACT_EMAIL ?? '',
    });
  }

  async getRecordTrackList(mbid: string): Promise<RecordTracklistResponseDto> {
    try {
      const recordingInfo = await this.musicBrainzApi.lookup('release', mbid, [
        'recordings',
      ]);
      const tracks = recordingInfo.media.flatMap((media) => media.tracks);

      return {
        trackList: tracks.map(
          (track): TrackDetailsDto => ({
            title: track.title,
            length: track.length || 0,
            position: track.position,
            release_data: recordingInfo['first-release-date'] || '',
          }),
        ),
      };
    } catch (error) {
      throw new Error('Not implemented');
    }
  }
}

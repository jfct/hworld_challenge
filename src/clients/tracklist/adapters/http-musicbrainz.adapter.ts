import { Injectable } from '@nestjs/common';
import { ITracklistAdapter } from '../interfaces/tracklist-adapter.interface';
import { env } from 'process';
import { RecordTracklistResponseDto } from '../dtos/record-track-list-response.dto';
import { TrackDetailsDto } from '../dtos/track-details.dto';
import { parseStringPromise } from 'xml2js';

/**
 * MusicBrainz implementation of the tracklist adapter
 * Uses direct HTTP calls to the MusicBrainz XML API
 */
@Injectable()
export class HttpMusicBrainzAdapter implements ITracklistAdapter {
  private readonly baseUrl = env.MUSICBRAINZ_API;
  private readonly userAgent = `${env.APPLICATION_NAME ?? 'hworld_challenge'}/${env.APPLICATION_VERSION ?? '0.1.0'} (${env.CONTACT_EMAIL ?? ''})`;

  async getRecordTrackList(mbid: string): Promise<RecordTracklistResponseDto> {
    try {
      const url = `${this.baseUrl}/release/${mbid}?inc=recordings`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      if (!response.ok) {
        throw new Error(
          `MusicBrainz API error: ${response.status} ${response.statusText}`,
        );
      }

      const xmlData = await response.text();
      const parsedData = await parseStringPromise(xmlData, {
        // Parse XML:
        // explicitArray: false keeps single elements as objects
        // mergeAttrs: true flattens attributes into parent
        explicitArray: false,
        mergeAttrs: true,
      });

      const release = parsedData.metadata.release;
      const mediaList = Array.isArray(release['medium-list'].medium)
        ? release['medium-list'].medium
        : [release['medium-list'].medium];

      const tracks = mediaList.flatMap((media) => {
        const trackList = media['track-list']?.track;
        if (!trackList) return [];
        return Array.isArray(trackList) ? trackList : [trackList];
      });

      return {
        trackList: tracks.map(
          (track): TrackDetailsDto => ({
            title: track.recording?.title || track.title || '',
            length: track.length ? parseInt(track.length) : 0,
            position: track.position ? parseInt(track.position) : 0,
            release_data: release.date || '',
          }),
        ),
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch tracklist from MusicBrainz: ${error.message}`,
      );
    }
  }
}

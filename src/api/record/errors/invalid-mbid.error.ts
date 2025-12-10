import { BadRequestException } from '@nestjs/common';

export class InvalidMbidError extends BadRequestException {
  constructor(recordId: string, mbid: string) {
    super(`MBID ${mbid} is invalid for record id ${recordId}`);
  }
}

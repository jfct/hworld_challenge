import { OmitType } from '@nestjs/swagger';
import { BaseRecordDto } from './base-record.dto';

export class CreateRecordRequestDto extends OmitType(BaseRecordDto, [
  'mbidStatus',
  'tracks',
  'tracksSyncedAt',
]) {}

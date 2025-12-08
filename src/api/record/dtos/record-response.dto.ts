import { IntersectionType } from '@nestjs/swagger';
import { EntityDto } from 'src/api/utils/dtos/entity.dto';
import { BaseRecordDto } from './base-record.dto';

export class RecordResponseDto extends IntersectionType(
  BaseRecordDto,
  EntityDto,
) {}

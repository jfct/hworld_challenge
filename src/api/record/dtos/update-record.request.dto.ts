import { PartialType } from '@nestjs/swagger';
import { CreateRecordRequestDto } from './create-record.request.dto';

export class UpdateRecordRequestDto extends PartialType(CreateRecordRequestDto) { }

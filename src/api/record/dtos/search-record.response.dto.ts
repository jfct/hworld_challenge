import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetadataDto } from 'src/api/utils/dtos/pagination.dto';
import { RecordResponseDto } from './record-response.dto';

export class SearchRecordResponseDto extends PaginationMetadataDto {
  @ApiProperty({
    description: 'A list of Record objects',
    type: [RecordResponseDto],
  })
  results: RecordResponseDto[];
}

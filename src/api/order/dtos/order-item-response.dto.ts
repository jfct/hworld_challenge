import { ApiProperty } from '@nestjs/swagger';
import { RecordResponseDto } from 'src/api/record/dtos/record-response.dto';
import { IOrderRecordItem } from '../schemas/order-record-item.schema';

export class OrderItemResponseDto
  implements IOrderRecordItem<RecordResponseDto | string>
{
  @ApiProperty({
    description: 'The record for this item (populated)',
    type: RecordResponseDto,
  })
  record: RecordResponseDto | string;

  @ApiProperty({ description: 'Quantity of this record', type: Number })
  quantity: number;
}

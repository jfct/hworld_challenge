import { BadRequestException } from '@nestjs/common';
import { RecordResponseDto } from 'src/api/record/dtos/record-response.dto';

export class InsufficientQuantityError extends BadRequestException {
  constructor(
    record: RecordResponseDto,
    requestedQuantity: number,
    availableQuantity: number,
  ) {
    super(
      `Insufficient quantity for record "${record.artist} - ${record.album}" (ID: ${record._id}). ` +
        `Requested: ${requestedQuantity}, Available: ${availableQuantity}`,
    );
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { RecordCategory, RecordFormat } from 'src/api/record/enums/record.enum';

export class LowStockRecordDto {
  @ApiProperty({
    description: 'Record ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Artist name',
    example: 'Pink Floyd',
  })
  artist: string;

  @ApiProperty({
    description: 'Album name',
    example: 'The Dark Side of the Moon',
  })
  album: string;

  @ApiProperty({
    description: 'Record format',
    enum: RecordFormat,
  })
  format: RecordFormat;

  @ApiProperty({
    description: 'Record category',
    enum: RecordCategory,
  })
  category: RecordCategory;

  @ApiProperty({
    description: 'Price of the record',
    example: 29.99,
  })
  price: number;

  @ApiProperty({
    description: 'Current stock quantity',
    example: 2,
  })
  qty: number;

  @ApiProperty({
    description: 'MusicBrainz ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    required: false,
  })
  mbid?: string;
}

export class LowStockResponseDto {
  @ApiProperty({
    description: 'Array of records with low stock',
    type: [LowStockRecordDto],
  })
  records: LowStockRecordDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { BaseRecordDto } from './base-record.dto';

export class RecordResponseDto extends BaseRecordDto {
    @ApiProperty({
        description: 'MongoDB document ID',
        type: String,
        example: '507f1f77bcf86cd799439011',
    })
    _id: string;

    @ApiProperty({
        description: 'Creation timestamp',
        type: String,
        example: '2024-01-01T00:00:00.000Z',
    })
    created: Date;

    @ApiProperty({
        description: 'Last modification timestamp',
        type: String,
        example: '2024-01-01T00:00:00.000Z',
    })
    lastModified: Date;

    @ApiProperty({
        description: 'Mongoose version key',
        type: Number,
        example: 0,
        required: false,
    })
    __v?: number;
}


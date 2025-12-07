import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EntityDto {
    @ApiProperty({
        description: 'MongoDB document ID',
        type: String,
        example: '507f1f77bcf86cd799439011',
    })
    _id: string;

    @ApiPropertyOptional({
        description: 'Creation timestamp',
        type: Date,
        example: '2024-01-01T00:00:00.000Z',
    })
    created?: Date;

    @ApiPropertyOptional({
        description: 'Last modification timestamp',
        type: Date,
        example: '2024-01-01T00:00:00.000Z',
    })
    lastModified?: Date;

    @ApiPropertyOptional({
        description: 'Mongoose version key',
        type: Number,
        example: 0,
    })
    __v?: number;
}
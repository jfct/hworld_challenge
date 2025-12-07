import { ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { RecordCategory, RecordFormat } from "../enums/record.enum";
import { BaseRecordDto } from "./base-record.dto";

export class SearchRecordRequestDto extends PartialType(OmitType(BaseRecordDto, ['format', 'category'] as const),) {
    @ApiPropertyOptional({
        description: 'A general query that can match artist or album',
        type: String,
        example: 'The Beatles',
        required: false
    })
    @IsString()
    @IsOptional()
    query?: string;

    @ApiPropertyOptional({
        description: 'Category of the record',
        enum: RecordCategory,
        isArray: true,
        example: [RecordCategory.ROCK],
        required: false
    })
    @IsArray()
    @IsEnum(RecordCategory, { each: true })
    @IsOptional()
    category?: RecordCategory[];


    @ApiPropertyOptional({
        description: 'Format of the record',
        enum: RecordFormat,
        isArray: true,
        example: [RecordFormat.VINYL],
        required: false
    })
    @IsArray()
    @IsEnum(RecordFormat, { each: true })
    @IsOptional()
    format?: RecordFormat[];

}
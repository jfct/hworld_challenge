import { ApiPropertyOptional, IntersectionType, OmitType, PartialType } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../utils/dtos/pagination.dto";
import { RecordCategory, RecordFormat } from "../enums/record.enum";
import { BaseRecordDto } from "./base-record.dto";

export class SearchRecordRequestDto extends IntersectionType(
    PartialType(OmitType(BaseRecordDto, ['format', 'category', 'qty'] as const)),
    PaginationDto
 ) {
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
    @IsEnum(RecordFormat, { each: true })
    @IsOptional()
    format?: RecordFormat[];

}
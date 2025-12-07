import { ApiProperty } from "@nestjs/swagger";
import { PaginationMetadataDto } from "src/api/utils/dtos/pagination.dto";
import { OrderResponseDto } from "./order-response.dto";

export class SearchOrderResponseDto extends PaginationMetadataDto {
    @ApiProperty({ description: "A list of Record objects", type: [OrderResponseDto] })
    results: OrderResponseDto[]
}
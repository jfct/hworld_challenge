import { IntersectionType } from "@nestjs/swagger";
import { EntityDto } from "src/api/utils/dtos/entity.dto";
import { BaseOrderDto } from "./base-order.dto";


export class OrderResponseDto extends IntersectionType(BaseOrderDto, EntityDto) { }
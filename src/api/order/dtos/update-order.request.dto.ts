import { PartialType } from "@nestjs/swagger";
import { BaseOrderDto } from "./base-order.dto";

export class UpdateOrderRequestDto extends PartialType(BaseOrderDto) { }
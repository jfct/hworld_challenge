import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { OrderStatus } from "../enums/order-status.enum";
import { IOrder } from "../schemas/order.schema";


export class BaseOrderDto implements IOrder {
    @ApiProperty({ description: "The record id connected to this order", type: String })
    @IsString()
    @IsNotEmpty()
    recordId: string;

    @ApiProperty({ description: "Number of records ordered", type: Number })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({ description: "Current order status", enum: OrderStatus })
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
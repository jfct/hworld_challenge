import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SearchRecordRequestDto } from "src/api/record/dtos/search-record.request.dto";
import { CreateOrderRequestDto } from "../dtos/create-order.request.dto";
import { OrderResponseDto } from "../dtos/order-response.dto";
import { SearchOrderRequestDto } from "../dtos/search-order.request.dto";
import { UpdateOrderRequestDto } from "../dtos/update-order.request.dto";
import { OrderService } from "../services/order.service";


@Controller()
export class OrderController {
    constructor(@Inject(OrderService) private readonly orderService: OrderService) { }

    @Post()
    @ApiOperation({ summary: 'Create an order' })
    @ApiBody({
        description: 'Payload with record, order info.',
        type: CreateOrderRequestDto,
    })
    @ApiResponse({ status: 200, description: 'Order created successfully', type: OrderResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async create(@Body() request: CreateOrderRequestDto) {
        return this.orderService.create(request);
    }

    @Patch()
    @ApiOperation({ summary: 'Updates an order' })
    @ApiBody({
        description: 'Payload with selected fields to update.',
        type: UpdateOrderRequestDto,
    })
    @ApiResponse({ status: 200, description: 'Order created successfully', type: OrderResponseDto })
    @ApiResponse({ status: 404, description: 'Cant find order to update' })
    async update(
        @Param("id") id: string,
        @Body() request: UpdateOrderRequestDto
    ) {
        return this.orderService.update(id, request);
    }

    @Get('/search')
    @ApiOperation({ summary: 'Get all orders with optional filters' })
    @ApiResponse({
        status: 200,
        description: 'List of records',
        type: SearchOrderRequestDto,
    })
    async findAll(@Query() filters: SearchRecordRequestDto) {
        return this.orderService.findAll(filters);
    }
}
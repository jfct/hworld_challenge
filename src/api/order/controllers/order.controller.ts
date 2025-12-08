import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateOrderRequestDto } from '../dtos/create-order.request.dto';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { SearchOrderRequestDto } from '../dtos/search-order.request.dto';
import { UpdateOrderRequestDto } from '../dtos/update-order.request.dto';
import { OrderService } from '../services/order.service';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject(OrderService)
    private readonly orderService: OrderService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an order' })
  @ApiBody({
    description: 'Payload with record, order info.',
    type: CreateOrderRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() request: CreateOrderRequestDto) {
    return this.orderService.create(request);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updates an order' })
  @ApiBody({
    description: 'Payload with selected fields to update.',
    type: UpdateOrderRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cant find order to update' })
  async update(
    @Query('id') id: string,
    @Body() request: UpdateOrderRequestDto,
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
  async findAll(@Query() filters: SearchOrderRequestDto) {
    return this.orderService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Search order by id' })
  @ApiResponse({
    status: 200,
    description: 'List of records',
    type: OrderResponseDto,
  })
  async findById(@Query('id') id: string) {
    return this.orderService.findById(id);
  }
}

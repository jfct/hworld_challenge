import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderRequestDto } from '../dtos/create-order.request.dto';
import { SearchOrderRequestDto } from '../dtos/search-order.request.dto';
import { UpdateOrderRequestDto } from '../dtos/update-order.request.dto';
import { Order, OrderHydrated } from '../schemas/order.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderHydrated>,
  ) {}

  async create(request: CreateOrderRequestDto) {
    const newOrder = await this.orderModel.create(request);
    return newOrder.toObject();
  }

  async update(id: string, request: UpdateOrderRequestDto) {
    const updated = await this.orderModel.findByIdAndUpdate(id, request, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new NotFoundException('Order not found');
    }

    return updated.toObject();
  }

  async findAll(filters: SearchOrderRequestDto) {}
}

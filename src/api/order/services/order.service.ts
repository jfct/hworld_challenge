import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderRequestDto } from '../dtos/create-order.request.dto';
import { SearchOrderRequestDto } from '../dtos/search-order.request.dto';
import { UpdateOrderRequestDto } from '../dtos/update-order.request.dto';
import { Order, OrderHydrated } from '../schemas/order.schema';
import { PAGINATION_LIMIT_VALUE } from 'src/api/utils/settings/pagination-settings';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { SearchOrderResponseDto } from '../dtos/search-order.response.dto';

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
    const updated = await this.orderModel
      .findByIdAndUpdate({ _id: id }, request, {
        new: true,
        runValidators: true,
      })
      .lean<OrderResponseDto>()
      .exec();

    if (!updated) {
      throw new NotFoundException('Order not found');
    }

    return updated;
  }

  async findById(id: string) {
    return this.orderModel.findById(id).populate('items.record');
  }

  async findAll(
    filters: SearchOrderRequestDto,
  ): Promise<SearchOrderResponseDto> {
    const {
      id,
      page = 1,
      limit = PAGINATION_LIMIT_VALUE,
      status,
      record,
      projection,
    } = filters;
    const skip = (page - 1) * limit;
    const query: any = {};

    if (id) {
      query._id = id;
    }

    if (status) {
      query.status = status;
    }

    if (record) {
      query['items.record'] = record;
    }

    const findQuery = this.orderModel.find(query).skip(skip).limit(limit);

    console.log('proj', projection);

    // Fill in the projections that we are requesting
    if (projection && projection.length > 0) {
      projection.map((value) => findQuery.populate(value));
    }

    const [results, total] = await Promise.all([
      findQuery.lean<OrderResponseDto[]>().exec(),
      this.orderModel.countDocuments(query).exec(),
    ]);

    return {
      results,
      page,
      count: total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

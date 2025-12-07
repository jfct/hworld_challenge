import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateOrderRequestDto } from "../dtos/create-order.request.dto";
import { SearchOrderRequestDto } from "../dtos/search-order.request.dto";
import { UpdateOrderRequestDto } from "../dtos/update-order.request.dto";
import { Order, OrderHydrated } from "../schemas/order.schema";

@Injectable()
export class OrderService {
    constructor(
        @InjectModel(Order.name)
        private readonly recordModel: Model<OrderHydrated>
    ) { }

    async create(request: CreateOrderRequestDto) {

    }

    async update(id: string, request: UpdateOrderRequestDto) {

    }

    async findAll(filters: SearchOrderRequestDto) {

    }
}
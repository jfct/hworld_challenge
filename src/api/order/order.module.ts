import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderController } from "./controllers/order.controller";
import { OrderSchema } from "./schemas/order.schema";
import { OrderService } from "./services/order.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Record', schema: OrderSchema }]),
    ],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule { }
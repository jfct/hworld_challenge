import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrderStatus } from '../enums/order-status.enum';

export interface IOrder {
  recordId: string;
  quantity: number;
  status: OrderStatus;
}

export type OrderHydrated = HydratedDocument<Order>;

@Schema({
  timestamps: {
    createdAt: 'created',
    updatedAt: 'lastModified',
  },
})
export class Order extends Document implements IOrder {
  @Prop({ required: true })
  recordId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ enum: OrderStatus, required: true })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

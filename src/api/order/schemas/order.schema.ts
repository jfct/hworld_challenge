import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderStatus } from '../enums/order-status.enum';
import {
  IOrderRecordItem,
  OrderRecordItem,
  OrderRecordItemSchema,
} from './order-record-item.schema';
import { Document, HydratedDocument, Types } from 'mongoose';

export type OrderHydrated = HydratedDocument<Order>;

export interface IOrder<T = Types.ObjectId> {
  items: IOrderRecordItem<T>[];
  status: OrderStatus;
}

@Schema({
  collection: 'orders',
  timestamps: {
    createdAt: 'created',
    updatedAt: 'lastModified',
  },
})
export class Order extends Document implements IOrder<Types.ObjectId> {
  @Prop({ type: [OrderRecordItemSchema], required: true })
  items: OrderRecordItem[];

  @Prop({ enum: OrderStatus, required: true, default: OrderStatus.PENDING })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Assumed most searched indexes
// Status and created, possible latest orders
// By records, we have this field specifically in service to search
OrderSchema.index({ status: 1, created: -1 });
OrderSchema.index({ 'items.record': 1 });

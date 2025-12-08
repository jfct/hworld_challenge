import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Record } from '../../record/schemas/record.schema';

export type OrderRecordItemHydrated = HydratedDocument<OrderRecordItem>;

export interface IOrderRecordItem<T = Types.ObjectId> {
  record: T;
  quantity: number;
}

@Schema({ _id: false })
export class OrderRecordItem
  extends Document
  implements IOrderRecordItem<Types.ObjectId>
{
  @Prop({ type: Types.ObjectId, ref: Record.name, required: true })
  record: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

export const OrderRecordItemSchema =
  SchemaFactory.createForClass(OrderRecordItem);

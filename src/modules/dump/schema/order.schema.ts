import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { OrderStatus } from '../../../common/constants/stg-constants';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ default: () => `order_${uuidv4()}` })
  _id: string;
  @Prop({ required: true })
  order_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  domain: string;

  @Prop({ required: true })
  transaction_id: string;

  @Prop({ type: Object, required: true })
  provider: Record<string, any>;

  @Prop({ type: String, required: true })
  item_id: string;

  @Prop({ type: String, required: true, ref: 'ItemDump' })
  item_details: string;

  @Prop({ type: Object })
  billing: Record<string, any>;

  @Prop({ type: Object, required: true })
  payments: Record<string, any>;

  @Prop({ type: Object, required: true })
  fulfillment: Record<string, any>;

  @Prop({ type: Object })
  quote: Record<string, any>;

  @Prop({ type: Object })
  rating: Record<string, any>;

  @Prop({ type: Boolean, default: false, required: false })
  is_added_to_wallet: boolean;

  @Prop({ type: String, default: '', required: false })
  certificate_url: string;

  @Prop({
    enum: OrderStatus,
    default: OrderStatus.STARTED,
  })
  status: OrderStatus;
}

export const OrderModel = Order.name;
export type OrderDocument = Order & Document;
export const OrderSchema = SchemaFactory.createForClass(Order);

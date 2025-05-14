import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';


export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderProduct {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;
}

const OrderProductSchema = SchemaFactory.createForClass(OrderProduct);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [OrderProductSchema], required: true })
  products: OrderProduct[];

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ default: 'pending' })
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

export const OrderSchema = SchemaFactory.createForClass(Order);

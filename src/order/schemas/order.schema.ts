import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Packed = 'packed',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
  Returned = 'returned',
  Refunded = 'refunded',
}

@Schema({ _id: false })
export class OrderProduct {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: false }) // Optional variant label (e.g., "500g pack", "Mathaniya variant")
  variantLabel?: string;
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

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Pending,
  })
  status: OrderStatus;

  @Prop({
    type: {
      shippingAddress: { type: String },
      courier: { type: String },
      trackingNumber: { type: String },
      estimatedDeliveryDate: { type: Date },
    },
    required: false,
  })
  shippingDetails?: {
    shippingAddress?: string;
    courier?: string;
    trackingNumber?: string;
    estimatedDeliveryDate?: Date;
  };
}

export const OrderSchema = SchemaFactory.createForClass(Order);

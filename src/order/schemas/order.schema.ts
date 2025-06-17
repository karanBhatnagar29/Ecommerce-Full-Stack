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

  // ✅ Existing shippingDetails (keep as-is)
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

  // ✅ Newly added shippingInfo
  @Prop({
    type: {
      shippingAddress: String,
      phone: String,
      alternatePhone: String,
      city: String,
      state: String,
      pincode: String,
      deliveryInstructions: String,
    },
    required: false,
  })
  shippingInfo?: {
    shippingAddress?: string;
    phone?: string;
    alternatePhone?: string;
    city?: string;
    state?: string;
    pincode?: string;
    deliveryInstructions?: string;
  };

  // ✅ Newly added paymentInfo
  @Prop({
    type: {
      paymentMethod: String,
      transactionId: String,
      isPaid: Boolean,
    },
    required: false,
  })
  paymentInfo?: {
    paymentMethod: string;
    transactionId?: string;
    isPaid?: boolean;
  };

  // ✅ Newly added couponCode
  @Prop({ type: String, required: false })
  couponCode?: string;

  // ✅ Newly added orderNotes
  @Prop({ type: String, required: false })
  orderNotes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

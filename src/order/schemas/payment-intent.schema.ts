// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, HydratedDocument, Types } from 'mongoose';

// @Schema({ timestamps: true })
// export class PaymentIntent {
//   @Prop({ required: true })
//   userId: string;

//   @Prop({ required: true })
//   amount: number;

//   @Prop({ required: true })
//   qrUrl: string;

//   @Prop({ default: false })
//   isPaid: boolean;

//   @Prop()
//   upiTxnId?: string;
// }

// export type PaymentIntentDocument = HydratedDocument<PaymentIntent>;
// export const PaymentIntentSchema = SchemaFactory.createForClass(PaymentIntent);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentIntent {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'INR' })
  currency: string;

  // Razorpay-specific
  @Prop()
  razorpayOrderId: string; // returned when creating order in Razorpay

  @Prop({ default: false })
  isPaid: boolean;

  // store the order draft until payment is confirmed
  @Prop({ type: Object })
  orderDraft: any;
}

export type PaymentIntentDocument = HydratedDocument<PaymentIntent>;
export const PaymentIntentSchema = SchemaFactory.createForClass(PaymentIntent);

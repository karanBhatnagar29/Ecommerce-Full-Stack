import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentIntent {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  qrUrl: string;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  upiTxnId?: string;
}

export type PaymentIntentDocument = HydratedDocument<PaymentIntent>;
export const PaymentIntentSchema = SchemaFactory.createForClass(PaymentIntent);

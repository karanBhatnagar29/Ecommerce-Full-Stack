// schemas/buy-now-session.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, expires: 900 }) // auto-expire in 15 minutes
export class BuyNowSession {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  productId: string;

  @Prop()
  variantLabel: string;

  @Prop({ default: 1 })
  quantity: number;
}

export type BuyNowSessionDocument = BuyNowSession & Document;
export const BuyNowSessionSchema = SchemaFactory.createForClass(BuyNowSession);

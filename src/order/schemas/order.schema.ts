import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Product } from 'src/product/schemas/product.schema';
import { User } from 'src/user/schemas/user.schema';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }])
  products: Product[];

  @Prop()
  totalPrice: number;

  @Prop({ default: 'pending' })
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';

  @Prop({ default: Date.now })
  createdAt: Date;
}
export const OrderSchema = SchemaFactory.createForClass(Order);

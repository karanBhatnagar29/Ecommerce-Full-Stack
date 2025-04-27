// src/product/schemas/product.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true }) // 👈 auto manages createdAt, updatedAt
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  brand: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [String] })
  images: string[];

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  numReviews: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

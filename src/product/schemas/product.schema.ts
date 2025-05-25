// src/product/schemas/product.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from '../../category/schemas/category.schema';

export type ProductDocument = Product & Document;

@Schema()
export class Variant {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  stock: number;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop()
  brand?: string;

  @Prop({ type: [String] })
  images?: string[];

  @Prop({ type: [VariantSchema], required: true })
  variants: Variant[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  numReviews: number;

  @Prop()
  gstIncluded?: boolean;

  @Prop()
  courierExtra?: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

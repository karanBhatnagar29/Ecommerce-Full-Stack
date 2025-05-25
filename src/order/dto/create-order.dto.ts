// src/order/dto/create-order.dto.ts

import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderProduct {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  variantLabel: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProduct)
  products: OrderProduct[];
}

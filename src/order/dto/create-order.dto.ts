// src/order/dto/create-order.dto.ts

import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderProduct {
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProduct)
  products: OrderProduct[];


}

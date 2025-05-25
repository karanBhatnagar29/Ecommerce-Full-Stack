// src/order/dto/create-order.dto.ts
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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

class ShippingDetailsDto {
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @IsString()
  @IsOptional()
  courier?: string;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsOptional()
  estimatedDeliveryDate?: Date;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProduct)
  products: OrderProduct[];

  @IsString()
  @IsNotEmpty()
  userId: string;  // User creating order

  @ValidateNested()
  @Type(() => ShippingDetailsDto)
  shippingDetails: ShippingDetailsDto;
}

import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderProductDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  variantLabel: string;
}

class ShippingInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string; // ✅ Add this field

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  @IsString()
  @IsOptional()
  deliveryInstructions?: string;
}

enum PaymentMethod {
  COD = 'COD',
  UPI = 'UPI',
  CARD = 'CARD',
  NET_BANKING = 'NET_BANKING',
}

class PaymentInfoDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}

export class CreateOrderDto {
  // @IsString()
  // @IsNotEmpty()
  // userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];

  @ValidateNested()
  @Type(() => ShippingInfoDto)
  shippingInfo: ShippingInfoDto;

  @ValidateNested()
  @Type(() => PaymentInfoDto)
  @IsOptional()
  paymentInfo?: PaymentInfoDto;

  @IsString()
  @IsOptional()
  couponCode?: string;

  @IsString()
  @IsOptional()
  orderNotes?: string;
}

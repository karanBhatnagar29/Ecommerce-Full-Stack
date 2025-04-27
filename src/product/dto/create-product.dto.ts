// src/product/dto/create-product.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  category: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsNumber()
  stock: number;
}

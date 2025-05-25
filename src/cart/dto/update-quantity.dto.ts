import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  Min,
  IsString,
} from 'class-validator';

export class UpdateQuantityDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  variantLabel: string; // Include this if you want to identify the variant to update

  @IsNumber()
  @Min(1)
  quantity: number;
}

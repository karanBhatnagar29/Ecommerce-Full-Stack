import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  Min,
  IsString,
} from 'class-validator';

export class AddItemDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty({ message: 'Variant label is required' })
  variantLabel: string;

  @IsNumber()
  @Min(1)
  quantity: number;

 

}

import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AddProductDto {
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  productId: string;
}

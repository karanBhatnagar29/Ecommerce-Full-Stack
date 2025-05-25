import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class RemoveProductDto {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  productId: string;
}

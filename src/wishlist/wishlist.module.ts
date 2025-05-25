import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { ProductModule } from 'src/product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { WishlistSchema } from './schemas/wishlist.schema';

@Module({
  imports: [
    ProductModule,
    MongooseModule.forFeature([
      {
        name: 'Wishlist',
        schema: WishlistSchema,
      },
    ]),
  ],
  providers: [WishlistService],
  controllers: [WishlistController],
})
export class WishlistModule {}

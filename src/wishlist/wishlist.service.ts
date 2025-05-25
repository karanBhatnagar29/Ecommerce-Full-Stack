import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name)
    private wishlistModel: Model<WishlistDocument>,
  ) {}

  async getWishlistByUser(userId: string) {
    const wishlist = await this.wishlistModel.findOne({ user: userId }).populate('products');
    if (!wishlist) return { products: [] };
    return wishlist;
  }

  async addProduct(userId: string, productId: string) {
    let wishlist = await this.wishlistModel.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new this.wishlistModel({
        user: userId,
        products: [new Types.ObjectId(productId)],
      });
    } else {
      const exists = wishlist.products.find(
        (p) => p.toString() === productId.toString(),
      );
      if (exists) return { message: 'Product already in wishlist' };

      wishlist.products.push(new Types.ObjectId(productId));
    }

    await wishlist.save();
    return { message: 'Product added to wishlist', wishlist };
  }

  async removeProduct(userId: string, productId: string) {
    const wishlist = await this.wishlistModel.findOne({ user: userId });
    if (!wishlist) throw new NotFoundException('Wishlist not found');

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId.toString(),
    );

    await wishlist.save();
    return { message: 'Product removed from wishlist', wishlist };
  }
}

// src/cart/cart.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Model, Types } from 'mongoose';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getCartByUser(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const cart = await this.cartModel
      .findOne({ user: userObjectId })
      .populate('items.productId', 'name'); // populate only the 'name' field of product

    if (!cart) {
      return { user: userId, items: [] };
    }

    return cart;
  }

  async addItemToCart(userId: string, dto: AddItemDto) {
    const product = await this.productModel.findById(dto.productId);
    if (!product) throw new NotFoundException('Product not found');

    const variant = product.variants.find((v) => v.label === dto.variantLabel);
    if (!variant) throw new BadRequestException('Invalid variant label');

    const price = variant.price;
    const subtotal = price * dto.quantity;

    const userObjectId = new Types.ObjectId(userId);

    // Find cart by user or create new
    let cart = await this.cartModel.findOne({ user: userObjectId });

    if (!cart) {
      // Create new cart with item
      cart = new this.cartModel({
        user: userObjectId,
        items: [
          {
            productId: new Types.ObjectId(dto.productId),
            variantLabel: dto.variantLabel,
            price,
            quantity: dto.quantity,
            subtotal,
          },
        ],
      });
    } else {
      // Update existing cart item or add new
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === dto.productId &&
          item.variantLabel === dto.variantLabel,
      );

      if (existingItem) {
        existingItem.quantity += dto.quantity;
        existingItem.subtotal = existingItem.quantity * price;
      } else {
        cart.items.push({
          productId: new Types.ObjectId(dto.productId),
          variantLabel: dto.variantLabel,
          price,
          quantity: dto.quantity,
          subtotal,
        });
      }
    }

    await cart.save();

    return { message: 'Item added to cart successfully' };
  }
  async updateItemQuantity(userId: string, dto: UpdateQuantityDto) {
    const cart = await this.cartModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!cart) throw new NotFoundException('Cart not found');

    const productIdStr = dto.productId.toString();

    const item = cart.items.find(
      (i) => i.productId.toString() === productIdStr,
    );

    if (!item) throw new NotFoundException('Item not in cart');

    item.quantity = dto.quantity;
    item.subtotal = item.price * dto.quantity;

    return await cart.save();
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString(),
    );

    const updatedCart = await cart.save();

    return {
      message: 'Item removed from cart successfully',
      cart: updatedCart,
    };
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = [];
    return await cart.save();
  }
}

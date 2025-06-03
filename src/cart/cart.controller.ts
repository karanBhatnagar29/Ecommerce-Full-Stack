// src/cart/cart.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Get()
  async getCart(@Req() req) {
    console.log('User ID from request:', req.user?.userId);
    return this.cartService.getCartByUser(req.user.userId);
  }

  @Post()
  // @UseGuards(JwtAuthGuard)
  async addToCart(@Req() req, @Body() dto: AddItemDto) {
    return this.cartService.addItemToCart(req.user.userId, dto); // ✅ use userId from JWT
  }

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  async updateQuantity(@Req() req, @Body() dto: UpdateQuantityDto) {
    return this.cartService.updateItemQuantity(req.user.userId, dto);
  }

  @Delete(':productId')
  async removeItem(@Req() req, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.userId, productId);
  }

  @Delete()
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}

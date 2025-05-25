import { Controller, Get, Post, Delete, Body, Req, UseGuards, Param } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Req() req) {
    return this.wishlistService.getWishlistByUser(req.user.userId);
  }

  @Post('add')
  async addProduct(@Req() req, @Body() body: { productId: string }) {
    return this.wishlistService.addProduct(req.user.userId, body.productId);
  }

  @Delete(':productId')
  async removeProduct(@Req() req, @Param('productId') productId: string) {
    return this.wishlistService.removeProduct(req.user.userId, productId);
  }
}

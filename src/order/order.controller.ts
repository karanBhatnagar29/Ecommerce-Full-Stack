import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrderStatus } from './schemas/order.schema';
import { Roles } from 'src/auth/roles-decorator';
import { RolesGuard } from 'src/auth/roles-guards';
import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['pending', 'shipped', 'delivered', 'cancelled'])
  status: OrderStatus;
}

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Admin: Get all orders
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async GetAll() {
    return await this.orderService.getAllOrder();
  }

  // Get order by ID
  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string) {
    const order = await this.orderService.getOrderByID(orderId);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // Get user orders
  @Get('user/:id')
  async getOrdersByUserId(@Param('id') userId: string) {
    const orders = await this.orderService.getOrderByUserId(userId);
    if (!orders) throw new NotFoundException('Orders not found');
    return orders;
  }

  // ❗ Step 1: Initiate payment, generate QR code
  @Post('initiate-payment')
  @UseGuards(JwtAuthGuard)
  async initiatePayment(
    @Req() req: any,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const userId = req.user.userId;
    if (!userId) throw new UnauthorizedException('User not authenticated');

    let total = 0;
    for (const item of createOrderDto.products) {
      const product = await this.orderService['productModel'].findById(
        item.productId,
      );
      const variant = product?.variants.find(
        (v) => v.label === item.variantLabel,
      );
      if (!variant) throw new NotFoundException('Invalid product or variant');
      total += variant.price * item.quantity;
    }

    const intent = await this.orderService.createPaymentIntent(userId, total);

    return {
      message: 'Scan the QR to pay',
      paymentIntentId: intent._id,
      amount: total,
      qrUrl: intent.qrUrl,
    };
  }

  // ❗ Step 2: Confirm payment (after user paid via UPI QR)
  @Post('confirm/:paymentIntentId')
  @UseGuards(JwtAuthGuard)
  async confirmPayment(
    @Param('paymentIntentId') paymentIntentId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const order = await this.orderService.confirmPaymentAndCreateOrder(
      paymentIntentId,
      createOrderDto,
    );
    return {
      message: 'Payment confirmed. Order created.',
      order,
    };
  }

  // Cancel order
  @Delete('cancel/:id')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(@Param('id') orderId: string, @Req() req: any) {
    const userId = req.user.userId;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.orderService.cancelOrder(orderId, userId);
  }

  // Update status
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, dto.status);
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuard)
  getOrdersByStatus(@Param('status') status: OrderStatus) {
    return this.orderService.getOrdersByStatus(status);
  }
  // POST /buy-now-session
  @Post('buy-now-session')
  @UseGuards(JwtAuthGuard)
  createBuyNow(@Req() req, @Body() body) {
    const userId = req.user._id;
    const { productId, variantLabel, quantity } = body;
    return this.orderService.createBuyNowSession(
      userId,
      productId,
      variantLabel,
      quantity,
    );
  }

  // GET /buy-now-session
  @Get('buy-now-session')
  @UseGuards(JwtAuthGuard)
  getBuyNow(@Req() req) {
    const userId = req.user._id;
    return this.orderService.getBuyNowSession(userId);
  }
}

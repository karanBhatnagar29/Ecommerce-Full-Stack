// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   NotFoundException,
//   Param,
//   Patch,
//   Post,
//   Req,
//   UnauthorizedException,
//   UseGuards,
// } from '@nestjs/common';
// import { OrderService } from './order.service';
// import { CreateOrderDto } from './dto/create-order.dto';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { OrderStatus } from './schemas/order.schema';
// import { Roles } from 'src/auth/roles-decorator';
// import { RolesGuard } from 'src/auth/roles-guards';
// import { IsIn } from 'class-validator';

// export class UpdateOrderStatusDto {
//   @IsIn(['pending', 'shipped', 'delivered', 'cancelled'])
//   status: OrderStatus;
// }

// @Controller('order')
// export class OrderController {
//   constructor(private readonly orderService: OrderService) {}

//   // Admin: Get all orders
//   // @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('admin')
//   @Get()
//   async GetAll(@Req() req) {
//     console.log('Requesting all orders');
//     console.log('Decoded user from JWT:', req.jwt); // just for debugging
//     return await this.orderService.getAllOrder();
//   }

//   // Get order by ID
//   @Get(':orderId')
//   async getOrderById(@Param('orderId') orderId: string) {
//     const order = await this.orderService.getOrderByID(orderId);
//     if (!order) throw new NotFoundException('Order not found');
//     return order;
//   }

//   // Get user orders
//   @Get('user/:id')
//   async getOrdersByUserId(@Param('id') userId: string) {
//     const orders = await this.orderService.getOrderByUserId(userId);
//     if (!orders) throw new NotFoundException('Orders not found');
//     return orders;
//   }

//   // ❗ Step 1: Initiate payment, generate QR code
//   @Post('initiate-payment')
//   @UseGuards(JwtAuthGuard)
//   async initiatePayment(
//     @Req() req: any,
//     @Body() createOrderDto: CreateOrderDto,
//   ) {
//     const userId = req.user.userId;
//     if (!userId) throw new UnauthorizedException('User not authenticated');

//     let total = 0;
//     for (const item of createOrderDto.products) {
//       const product = await this.orderService['productModel'].findById(
//         item.productId,
//       );
//       const variant = product?.variants.find(
//         (v) => v.label === item.variantLabel,
//       );
//       if (!variant) throw new NotFoundException('Invalid product or variant');
//       total += variant.price * item.quantity;
//     }

//     const intent = await this.orderService.createPaymentIntent(userId, total);

//     return {
//       message: 'Scan the QR to pay',
//       paymentIntentId: intent._id,
//       amount: total,
//       qrUrl: intent.qrUrl,
//     };
//   }

//   // ❗ Step 2: Confirm payment (after user paid via UPI QR)
//   @Post('confirm/:paymentIntentId')
//   @UseGuards(JwtAuthGuard)
//   async confirmPayment(
//     @Param('paymentIntentId') paymentIntentId: string,
//     @Body() createOrderDto: CreateOrderDto,
//   ) {
//     const order = await this.orderService.confirmPaymentAndCreateOrder(
//       paymentIntentId,
//       createOrderDto,
//     );
//     return {
//       message: 'Payment confirmed. Order created.',
//       order,
//     };
//   }

//   // Cancel order
//   @Delete('cancel/:id')
//   @UseGuards(JwtAuthGuard)
//   async cancelOrder(@Param('id') orderId: string, @Req() req: any) {
//     const userId = req.user.userId;
//     if (!userId) throw new UnauthorizedException('User not authenticated');
//     return this.orderService.cancelOrder(orderId, userId);
//   }

//   // Update status
//   @Patch(':id/status')
//   @UseGuards(JwtAuthGuard)
//   async updateStatus(
//     @Param('id') id: string,
//     @Body() dto: UpdateOrderStatusDto,
//   ) {
//     return this.orderService.updateOrderStatus(id, dto.status);
//   }

//   @Get('status/:status')
//   @UseGuards(JwtAuthGuard)
//   getOrdersByStatus(@Param('status') status: OrderStatus) {
//     return this.orderService.getOrdersByStatus(status);
//   }
//   // POST /buy-now-session
//   @Post('buy-now-session')
//   @UseGuards(JwtAuthGuard)
//   createBuyNow(@Req() req, @Body() body) {
//     const userId = req.user._id;
//     const { productId, variantLabel, quantity } = body;
//     return this.orderService.createBuyNowSession(
//       userId,
//       productId,
//       variantLabel,
//       quantity,
//     );
//   }

//   // GET /buy-now-session
//   @Get('buy-now-session')
//   @UseGuards(JwtAuthGuard)
//   getBuyNow(@Req() req) {
//     const userId = req.user._id;
//     return this.orderService.getBuyNowSession(userId);
//   }
// }

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
  BadRequestException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrderStatus } from './schemas/order.schema';
import { Roles } from 'src/auth/roles-decorator';
import { RolesGuard } from 'src/auth/roles-guards';
import { IsIn } from 'class-validator';
import * as crypto from 'crypto';

export class UpdateOrderStatusDto {
  @IsIn(['pending', 'shipped', 'delivered', 'cancelled'])
  status: OrderStatus;
}

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ========== ADMIN ==========

  @Roles('admin')
  @Get()
  async GetAll() {
    return this.orderService.getAllOrder();
  }

  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string) {
    const order = await this.orderService.getOrderByID(orderId);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  @Get('user/:id')
  async getOrdersByUserId(@Param('id') userId: string) {
    const orders = await this.orderService.getOrderByUserId(userId);
    if (!orders) throw new NotFoundException('Orders not found');
    return orders;
  }

  // ========== RAZORPAY FLOW ==========

  // Step 1: Create Razorpay Order
  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(@Req() req: any, @Body() dto: CreateOrderDto) {
    const userId = req.user.userId || req.user._id;
    if (!userId) throw new UnauthorizedException('User not authenticated');

    try {
      const { paymentIntent, razorpayOrder, amount } =
        await this.orderService.createPaymentIntentFromDto(
          userId.toString(),
          dto,
        );

      return {
        paymentIntentId: paymentIntent._id,
        razorpayOrderId: razorpayOrder.id,
        amount,
      };
    } catch (err) {
      console.error('create-payment-intent failed:', err);
      throw err; // <-- do not wrap again
    }
  }

  // Step 2: Verify signature + create actual order
  @Post('verify-payment')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(
    @Req() req: any,
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      paymentIntentId: string;
      order: CreateOrderDto;
    },
  ) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paymentIntentId,
        order,
      } = body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !paymentIntentId
      ) {
        throw new BadRequestException('Missing required payment parameters');
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        throw new BadRequestException('Razorpay secret key is not configured');
      }

      // Step 1: Verify Razorpay signature
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        throw new BadRequestException('Invalid payment signature');
      }

      // Step 2: Fetch PaymentIntent
      const intent =
        await this.orderService['paymentIntentModel'].findById(paymentIntentId);
      if (!intent) throw new BadRequestException('Payment intent not found');

      // Step 3: Mark payment as paid
      intent.isPaid = true;
      intent.razorpayPaymentId = razorpay_payment_id;
      await intent.save();

      // Step 4: Create actual order
      const userId = req.user.userId || req.user._id;
      const createdOrder = await this.orderService.confirmPaymentAndCreateOrder(
        userId.toString(),
        paymentIntentId,
        order,
      );

      return {
        message: 'Payment verified and order created successfully',
        order: createdOrder,
      };
    } catch (error) {
      console.error('verify-payment error:', error);
      throw new BadRequestException(
        error.message || 'Payment verification failed',
      );
    }
  }

  // ========== OTHER EXISTING ENDPOINTS ==========

  @Delete('cancel/:id')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(@Param('id') orderId: string, @Req() req: any) {
    const userId = req.user.userId || req.user._id;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.orderService.cancelOrder(orderId, userId.toString());
  }

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

  @Post('buy-now-session')
  @UseGuards(JwtAuthGuard)
  createBuyNow(@Req() req, @Body() body) {
    const userId = req.user.userId || req.user._id;
    const { productId, variantLabel, quantity } = body;
    return this.orderService.createBuyNowSession(
      userId.toString(),
      productId,
      variantLabel,
      quantity,
    );
  }

  @Get('buy-now-session')
  @UseGuards(JwtAuthGuard)
  getBuyNow(@Req() req) {
    const userId = req.user.userId || req.user._id;
    return this.orderService.getBuyNowSession(userId.toString());
  }
}

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
import { Types } from 'mongoose';

export class UpdateOrderStatusDto {
  @IsIn(['pending', 'shipped', 'delivered', 'cancelled'])
  status: OrderStatus;
}

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @UseGuards(JwtAuthGuard)
  @Roles('admin') // Only authenticated users can access these routes
  @Get()
  async GetAll() {
    return await this.orderService.getAllOrder();
  }

  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string) {
    const order = await this.orderService.getOrderByID(orderId);
    if (!order) {
      throw new NotFoundException('order not found');
    }
    return order;
  }

  @Get('user/:id')
  async getOrdersByUserId(@Param('id') userId: string) {
    const orders = await this.orderService.getOrderByUserId(userId);
    if (!orders) {
      throw new NotFoundException('order not found');
    }
    return orders;
  }
  // POST /order/:userId
  // @Post(':userId')
  // async createOrder(
  //   @Param('userId') userId: string, // ✅ Expect userId from the route
  //   @Body() createOrderDto: CreateOrderDto,
  // ) {
  //   try {
  //     return await this.orderService.createOrder(createOrderDto, userId); // ✅ Pass userId
  //   } catch (error) {
  //     throw new NotFoundException(error.message || 'Failed to create order.');
  //   }
  // }

  // cancel order
  @Delete('cancel/:id')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(@Param('id') orderId: string, @Req() req: any) {
    console.log('req.user:', req.user); // for debugging
    const userId = req.user.userId; // <-- Use userId here, not id
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.orderService.cancelOrder(orderId, userId);
  }

  //status
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin') // Only admin allowed to update status
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, dto.status);
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  getOrdersByStatus(@Param('status') status: OrderStatus) {
    return this.orderService.getOrdersByStatus(status);
  }
}

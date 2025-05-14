import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async GetALl() {
    return await this.orderService.getAllOrder();
  }

  @Get('orderId')
  async getOrderById(@Param('orderId') orderId: string) {
    const order = await this.orderService.getOrderByID(orderId);
    if (!order) {
      throw new NotFoundException('order not found');
    }
  }

  @Get('user/:id')
  async getOrdersByUserId(@Param('id') userId: string){
    const orders = await this.orderService.getOrderByUserId(userId);
   if(!orders){
    throw new NotFoundException("order not found")
   }
  }
    // POST /orders/:userId
    @Post(':userId')
    async createOrder(
      @Param('userId') userId: string,  // ✅ Expect userId from the route
      @Body() createOrderDto: CreateOrderDto
    ) {
      try {
        return await this.orderService.createOrder(createOrderDto, userId);  // ✅ Pass userId
      } catch (error) {
        throw new NotFoundException(error.message || 'Failed to create order.');
      }
    }
}

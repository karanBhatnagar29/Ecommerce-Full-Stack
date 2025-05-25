import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';
import { Model, Types } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  // Get All orders
  async getAllOrder() {
    return await this.orderModel
      .find()
      .populate('user')
      .populate('products.productId');
  }

  // Get order by ID
  async getOrderByID(id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('products.productId')
      .populate('user');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // Get orders by user ID
  async getOrderByUserId(id: string) {
    return await this.orderModel
      .find({ user: id })
      .populate('products.productId')
      .populate('user');
  }

  // Create order


  // cancel order
  async cancelOrder(orderId: string, userId: string) {
    const order = await this.orderModel.findById(orderId);
    console.log('Order fetched:', order);
    if (!order) throw new NotFoundException('Order not found');
    console.log('Order user:', order.user);

    // Defensive check to avoid undefined
    if (!order.user || order.user.toString() !== userId.toString()) {
      throw new ForbiddenException('You are not allowed to cancel this order');
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      throw new BadRequestException('Cannot cancel after shipment');
    }

    order.status = OrderStatus.Cancelled;
    return await order.save();
  }

  // order status update
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Optional: add validation logic to prevent invalid status transitions
    // e.g. no going back from Delivered to Packed etc.

    order.status = status;
    return await order.save();
  }

  async getOrdersByStatus(status: OrderStatus) {
    return this.orderModel
      .find({ status })
      .populate('user')
      .populate('products.productId');
  }
}

import {  Injectable, NotFoundException, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';

@Injectable()
export class OrderService {
  orderService: any;
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>
  ) {}

  // Get All orders
  async getAllOrder() {
    return await this.orderModel
      .find()
      .populate('user')
      .populate('products.productId');
  }

  //Get orders by id
  async getOrderByID(@Param('id') id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('products.productId')
      .populate('user');

    if (!order) {
      throw new NotFoundException('order not found');
    }

    return order;
  }

  // get orders by user id
  async getOrderByUserId(@Param('id') id: string) {
    const order = await this.orderModel
      .find({ user: id })
      .populate('product.productId')
      .populate('user');
    return order;
  }

  // create order
  async createOrder(createOrderDto: CreateOrderDto, userId: string) { // Expect userId as string
    const productIds = createOrderDto.products.map((p) => p.productId);
    const products = await this.productModel.find({ _id: { $in: productIds } });
  
    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found.');
    }
  
    let totalPrice = 0;
    const orderItems = createOrderDto.products.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found.`);
      totalPrice += product.price * item.quantity;
      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      };
    });
  
    // ✅ Use userId directly
    const order = new this.orderModel({
      user: userId, // ✅ Fix: Pass userId directly
      products: orderItems,
      totalPrice,
    });
  
  
    return await order.save();
  }

  

}

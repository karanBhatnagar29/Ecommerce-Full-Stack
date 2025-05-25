import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';

// admin.service.ts
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async getDashboardStats() {
    const [users, orders, products] = await Promise.all([
      this.userModel.countDocuments(),
      this.orderModel.find(),
      this.productModel.countDocuments(),
    ]);

    const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    return {
      totalUsers: users,
      totalProducts: products,
      totalOrders: orders.length,
      revenue,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
    };
  }

  async getAllUsers() {
    return this.userModel.find();
  }

  async getAllOrders() {
    return this.orderModel
      .find()
      .populate('user')
      .populate('products.productId');
  }
}

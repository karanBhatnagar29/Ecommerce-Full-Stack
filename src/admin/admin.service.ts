import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly jwtService: JwtService,
  ) {}

  // --------------------------
  // AUTH METHODS
  // --------------------------

  async signup(dto: { email: string; password: string; role: string }) {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = new this.userModel({
      email: dto.email,
      password: hashedPassword,
      role: dto.role || 'admin',
    });

    await newUser.save();
    return { message: 'Account created successfully' };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      role: user.role,
    };
  }

  // --------------------------
  // DASHBOARD METHODS
  // --------------------------

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

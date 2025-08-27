// order.service.ts

import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';
import { Model, Types } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  PaymentIntent,
  PaymentIntentDocument,
} from './schemas/payment-intent.schema';
import {
  BuyNowSession,
  BuyNowSessionDocument,
} from './schemas/buy-now-session.schema';
import Razorpay from 'razorpay';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(PaymentIntent.name)
    private readonly paymentIntentModel: Model<PaymentIntentDocument>,
    @InjectModel(BuyNowSession.name)
    private readonly buyNowSessionModel: Model<BuyNowSessionDocument>,
    @Inject('RAZORPAY_CLIENT')
    private readonly razorpayClient: Razorpay,
  ) {}

  // Get All orders
  async getAllOrder() {
    return this.orderModel
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

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // Get orders by user ID
  async getOrderByUserId(id: string) {
    return this.orderModel
      .find({ user: id })
      .populate('products.productId')
      .populate('user');
  }

  // Create order (userId comes separately)
  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const { products, shippingInfo, paymentInfo, couponCode, orderNotes } =
      createOrderDto;

    let totalPrice = 0;

    for (const item of products) {
      const product = await this.productModel.findById(item.productId).exec();
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      const variant = product.variants.find(
        (v) => v.label === item.variantLabel,
      );
      if (!variant) {
        throw new NotFoundException(
          `Variant "${item.variantLabel}" not found for product ${product.name}`,
        );
      }

      totalPrice += variant.price * item.quantity;
    }

    const order = new this.orderModel({
      user: new Types.ObjectId(userId),
      products: products.map((p) => ({
        productId: new Types.ObjectId(p.productId),
        quantity: p.quantity,
        variantLabel: p.variantLabel,
      })),
      totalPrice,
      status: OrderStatus.Pending,
      shippingInfo,
      paymentInfo,
      couponCode,
      orderNotes,
    });

    return order.save();
  }

  // Cancel order
  async cancelOrder(orderId: string, userId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (!order.user || order.user.toString() !== userId.toString()) {
      throw new ForbiddenException('You are not allowed to cancel this order');
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      throw new BadRequestException('Cannot cancel after shipment');
    }

    order.status = OrderStatus.Cancelled;
    return await order.save();
  }

  // Update order status (for admin)
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;
    return await order.save();
  }

  async getOrdersByStatus(status: OrderStatus) {
    return this.orderModel
      .find({ status })
      .populate('user')
      .populate('products.productId');
  }

  // Payment intent
  async createPaymentIntent(
    userId: string,
    amount: number,
    createOrderDto: CreateOrderDto,
  ) {
    try {
      const razorpayOrder = await this.razorpayClient.orders.create({
        amount: amount * 100, // ✅ paise
        currency: 'INR',
        payment_capture: true,
      });

      const paymentIntent = new this.paymentIntentModel({
        userId,
        products: createOrderDto.products,
        amount,
        razorpayOrderId: razorpayOrder.id,
        status: 'pending',
      });

      await paymentIntent.save();

      return { paymentIntent, razorpayOrder };
    } catch (err) {
      console.error('Razorpay error:', err); // ✅ helps debug
      throw new BadRequestException(
        `Failed to create payment intent: ${err.message}`,
      );
    }
  }

  async confirmPaymentAndCreateOrder(
    userId: string,
    paymentIntentId: string,
    orderDto: CreateOrderDto,
  ) {
    const intent = await this.paymentIntentModel.findById(paymentIntentId);
    if (!intent || !intent.isPaid) {
      throw new BadRequestException('Payment not completed');
    }

    return this.createOrder(userId, orderDto);
  }

  // Buy Now session
  async createBuyNowSession(
    userId: string,
    productId: string,
    variantLabel: string,
    quantity: number = 1,
  ) {
    await this.buyNowSessionModel.deleteMany({ userId });

    const session = new this.buyNowSessionModel({
      userId,
      productId,
      variantLabel,
      quantity,
    });

    return session.save();
  }

  async getBuyNowSession(userId: string) {
    return this.buyNowSessionModel.findOne({ userId });
  }
}

import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { ProductService } from 'src/product/product.service';
import { ProductModule } from 'src/product/product.module';
import {
  PaymentIntent,
  PaymentIntentSchema,
} from './schemas/payment-intent.schema';
import {
  BuyNowSession,
  BuyNowSessionSchema,
} from './schemas/buy-now-session.schema';
import { RazorpayProvider } from './razorpay.provider';

@Module({
  imports: [
    ProductModule,
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      { name: PaymentIntent.name, schema: PaymentIntentSchema },
      {
        name: BuyNowSession.name,
        schema: BuyNowSessionSchema,
      },
    ]),
  ],
  providers: [OrderService, RazorpayProvider],
  controllers: [OrderController],
})
export class OrderModule {}

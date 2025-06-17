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

@Module({
  imports: [
    ProductModule,
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      { name: PaymentIntent.name, schema: PaymentIntentSchema },
    ]),
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}

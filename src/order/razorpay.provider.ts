// src/order/razorpay.provider.ts
import { ConfigService } from '@nestjs/config';
import { config } from 'process';
import Razorpay from 'razorpay';

export const RazorpayProvider = {
  provide: 'RAZORPAY_CLIENT',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const keyId = config.get<string>('RAZORPAY_KEY_ID');
    const keySecret = config.get<string>('RAZORPAY_KEY_SECRET');

    console.log('Initializing Razorpay Client...', keyId, keySecret);

    console.log('🔑 Razorpay Key ID:', keyId); // 👈 Debug log
    console.log('🔑 Razorpay Key Secret:', keySecret ? '****' : 'MISSING');

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are missing in .env');
    }

    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  },
};

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove unexpected properties
      forbidNonWhitelisted: false, // throw error for unexpected properties
      transform: true, // auto-transform payloads to DTO instances
    }),
  );
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({
    origin: [
      'http://63.178.76.247:3001',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://63.178.76.247:3002',
      'http://www.zestycrops.com',
      'http://zestycrops.com',
      'https://www.zestycrops.com',
      'https://zestycrops.com',
      'http://www.admin.zestycrops.com',
      'http://admin.zestycrops.com',
      'https://www.admin.zestycrops.com',
      'https://admin.zestycrops.com',
      'http://www.api.zestycrops.com',
      'http://api.zestycrops.com',
      'https://www.api.zestycrops.com',
      'https://api.zestycrops.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();

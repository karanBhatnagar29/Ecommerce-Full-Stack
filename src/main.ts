import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove unexpected properties
      forbidNonWhitelisted: false, // throw error for unexpected properties
      transform: true, // auto-transform payloads to DTO instances
    }),
  );
  app.enableCors({
    origin: [
      'http://63.178.76.247:3001',
      'http://localhost:3000',
      'http://63.178.76.247:3002',
      'http://www.zestycrops.com',
      'http://zestycrops.com',
      'https://www.zestycrops.com',
      'https://zestycrops.com',
      'admin.zestycrops.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();

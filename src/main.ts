import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove unexpected properties
      forbidNonWhitelisted: true, // throw error for unexpected properties
      transform: true, // auto-transform payloads to DTO instances
    }),
  );
  app.enableCors({
    origin: ['http://localhost:3001'], // allow your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

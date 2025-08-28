import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from './schemas/category.schema';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from '@nestjs/passport';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
    AuthModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [MongooseModule],
})
export class CategoryModule {}

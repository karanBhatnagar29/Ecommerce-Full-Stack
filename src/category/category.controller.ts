// src/category/category.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles-guards';
import { Roles } from 'src/auth/roles-decorator';
import { FileInterceptor } from '@nestjs/platform-express';
const multer = require('multer');
// import { RolesGuard } from 'src/auth/guards/roles.guard';
// import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('create')
  @UseInterceptors(FileInterceptor('image')) // 'image' is the field name in the multipart form
  async create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryService.create(dto, file);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', { storage: multer.memoryStorage() }),
  )
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    if (image) {
      dto.image = image.buffer.toString('base64'); // convert buffer to base64 string
    }
    const updated = await this.categoryService.update(id, dto);

    if (!updated) {
      throw new NotFoundException('Category not found');
    }

    return updated;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    this.categoryService.delete(id);
    return { message: 'Category deleted successfully' };
  }
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }
}

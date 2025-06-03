import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
  cloudinaryService: any;
  constructor(private readonly productService: ProductService) {}

  // get(all)
  @Get()
  async getAllProducts() {
    return await this.productService.getAllProducts();
  }

  // get(by id)
  @Get('/:id')
  async getProductById(@Param('id') id: string) {
    return await this.productService.getProductById(id);
  }

  // create('create')
  @Post('create')
  @UseInterceptors(FilesInterceptor('images')) // expects files in 'images' field
  async createProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const parsedVariants =
      typeof body.variants === 'string'
        ? JSON.parse(body.variants)
        : body.variants;

    const createDto: CreateProductDto = {
      ...body,
      variants: parsedVariants,
    };

    return this.productService.createProduct(createDto, files);
  }

  // patch('update/:id')
  @Patch('update/:id')
  @UseInterceptors(FilesInterceptor('images')) // Accepts files in 'images' field
  async updateProduct(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const parsedVariants =
      typeof body.variants === 'string'
        ? JSON.parse(body.variants)
        : body.variants;

    const updateDto: UpdateProductDto = {
      ...body,
      variants: parsedVariants,
    };

    return this.productService.updateProduct(id, updateDto, files);
  }

  // delete('delete/:id)
  @Delete('delete/:id')
  async deleteProduct(@Param('id') id: string) {
    await this.productService.deleteProduct(id);
    return { message: 'Product deleted successfully' };
  }
  @Get('/category/:slug')
  getProductsByCategory(@Param('slug') slug: string) {
    return this.productService.getProductsByCategorySlug(slug);
  }
}

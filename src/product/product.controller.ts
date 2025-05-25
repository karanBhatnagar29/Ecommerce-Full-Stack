import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
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
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productService.createProduct(createProductDto);
  }

  // patch('update/:id')
  @Patch('update/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.updateProduct(id, updateProductDto);
  }

  // delete('delete/:id)
  @Delete('delete/:id')
  async deleteProduct(@Param('id') id: string) {
    await this.productService.deleteProduct(id);
    return { message: 'Product deleted successfully' };
  }
  @Get('/category/:name')
  getProductsByCategory(@Param('name') name: string) {
    return this.productService.getProductsByCategoryName(name);
  }
}

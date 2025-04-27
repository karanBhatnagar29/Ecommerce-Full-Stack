import { Body, Injectable, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  //get all products
  async getAllProducts() {
    return await this.productModel.find();
  }
  //get product by id
  async getProductById(@Param('id') id: string) {
    return await this.productModel.findById(id);
  }
  // create product
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const product = new this.productModel(createProductDto);
    return await product.save();
  }
  // update product
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productModel.findByIdAndUpdate(id, updateProductDto, {
      new: true,
    });
  }
  // delete product
  async deleteProduct(@Param('id') id: string) {
    return this.productModel.findByIdAndDelete(id);
  }
}

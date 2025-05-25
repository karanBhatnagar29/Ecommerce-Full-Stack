import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  Category,
  CategoryDocument,
} from 'src/category/schemas/category.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  // ✅ Get all products
  async getAllProducts() {
    return this.productModel.find().exec();
  }

  // ✅ Get product by ID
  async getProductById(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // ✅ Create product
  async createProduct(createProductDto: CreateProductDto) {
    const productData = {
      ...createProductDto,
      category: new Types.ObjectId(createProductDto.category),
    };
    const product = new this.productModel(productData);
    return product.save(); // No need for await if directly returning
  }

  // ✅ Update product
  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const updateData: any = { ...updateProductDto };
    if (updateProductDto.category) {
      updateData.category = new Types.ObjectId(updateProductDto.category);
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).exec();

    if (!updatedProduct) throw new NotFoundException('Product not found');
    return updatedProduct;
  }

  // ✅ Delete product
  async deleteProduct(id: string) {
    const deleted = await this.productModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Product not found');
    return deleted;
  }

  // ✅ Get products by category name
  async getProductsByCategoryName(categoryName: string) {
    const category = await this.categoryModel.findOne({ name: categoryName }).exec();

    if (!category) {
      throw new NotFoundException(`Category "${categoryName}" not found`);
    }

    return this.productModel.find({ category: category._id }).exec();
  }
}

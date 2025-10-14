import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  Category,
  CategoryDocument,
} from 'src/category/schemas/category.schema';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import * as streamifier from 'streamifier';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {
    cloudinary.config({
      cloud_name: 'dkln9vlws',
      api_key: '418447326674851',
      api_secret: '788g2ZjmcMQbhJF8UI2ckNYFaDk',
    });
  }

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
  async createProduct(
    createProductDto: CreateProductDto,
    files?: Express.Multer.File[],
  ) {
    try {
      // Helper function for Cloudinary upload
      const uploadToCloudinary = (
        file: Express.Multer.File,
      ): Promise<string> => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'products' },
            (error, result) => {
              if (error) return reject(error);
              if (!result)
                return reject(new Error('No result from Cloudinary'));
              resolve(result.secure_url);
            },
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
      };

      const productImages: string[] = [];
      const variantImagesMap: Record<number, string[]> = {};

      // ✅ Sort files into product-level or variant-level
      for (const file of files || []) {
        if (file.fieldname === 'images') {
          const url = await uploadToCloudinary(file);
          productImages.push(url);
        } else if (file.fieldname.startsWith('variantImages[')) {
          const match = file.fieldname.match(/variantImages\[(\d+)\]/);
          if (match) {
            const variantIndex = parseInt(match[1]);
            const url = await uploadToCloudinary(file);
            if (!variantImagesMap[variantIndex])
              variantImagesMap[variantIndex] = [];
            variantImagesMap[variantIndex].push(url);
          }
        }
      }

      // ✅ Attach uploaded images to their variants
      const variantsWithImages = (createProductDto.variants || []).map(
        (v, index) => ({
          ...v,
          images: variantImagesMap[index] || [],
        }),
      );

      const productData = {
        ...createProductDto,
        category: new Types.ObjectId(createProductDto.category),
        images: productImages,
        variants: variantsWithImages,
      };

      const product = await this.productModel.create(productData);
      return product;
    } catch (error) {
      console.error('[Product Create Error]', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // ✅ Update product
  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    files?: Express.Multer.File[],
  ) {
    try {
      const updateData: any = { ...updateProductDto };

      if (updateProductDto.category) {
        updateData.category = new Types.ObjectId(updateProductDto.category);
      }

      // Upload new images if provided
      if (files?.length) {
        const imageUrls: string[] = [];

        const uploadToCloudinary = (
          file: Express.Multer.File,
        ): Promise<string> => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'products' },
              (error, result) => {
                if (error) return reject(error);
                if (!result)
                  return reject(
                    new Error('No result returned from Cloudinary'),
                  );
                resolve(result.secure_url);
              },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
          });
        };

        for (const file of files) {
          const url = await uploadToCloudinary(file);
          imageUrls.push(url);
        }

        updateData.images = imageUrls;
      }

      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
        },
      );

      if (!updatedProduct) throw new NotFoundException('Product not found');
      return updatedProduct;
    } catch (error) {
      console.error('[Product Update Error]', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // ✅ Delete product
  async deleteProduct(id: string) {
    const deleted = await this.productModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Product not found');
    return deleted;
  }

  // ✅ Get products by category name
  async getProductsByCategorySlug(slug: string) {
    const category = await this.categoryModel.findOne({ slug }).exec();

    if (!category) {
      throw new NotFoundException(`Category "${slug}" not found`);
    }

    return this.productModel.find({ category: category._id }).exec();
  }
}

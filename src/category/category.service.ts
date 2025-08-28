// src/category/category.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import slugify from 'slugify';

@Injectable()
export class CategoryService {
  cloudinary: any;
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {
    cloudinary.config({
      cloud_name: 'dkln9vlws',
      api_key: '418447326674851',
      api_secret: '788g2ZjmcMQbhJF8UI2ckNYFaDk',
    });
  }

  // async create(createDto: CreateCategoryDto, image?: Express.Multer.File) {
  //   try {
  //     const existing = await this.categoryModel.findOne({
  //       name: createDto.name,
  //     });
  //     if (existing) {
  //       throw new Error('Category already exists');
  //     }

  //     let imageUrl = '';
  //     if (image) {
  //       const uploadFromBuffer = (): Promise<any> => {
  //         return new Promise((resolve, reject) => {
  //           const uploadStream = cloudinary.uploader.upload_stream(
  //             { folder: 'categories' },
  //             (error, result) => {
  //               if (error) return reject(error);
  //               resolve(result);
  //             },
  //           );
  //           streamifier.createReadStream(image.buffer).pipe(uploadStream);
  //         });
  //       };

  //       const upload = await uploadFromBuffer();
  //       imageUrl = upload.secure_url;
  //     }

  //     const category = await this.categoryModel.create({
  //       ...createDto,
  //       image: imageUrl,
  //     });

  //     return category;
  //   } catch (error) {
  //     console.error('[Category Create Error]', error);
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  async create(createDto: CreateCategoryDto, image?: Express.Multer.File) {
    try {
      console.log('🟢 Service: create category called');
      console.log('Category Name:', createDto.name);

      // Check if category exists
      const existing = await this.categoryModel.findOne({
        name: createDto.name,
      });
      if (existing) {
        console.warn('⚠️ Category already exists:', createDto.name);
        throw new Error('Category already exists');
      }

      // Upload image if exists
      let imageUrl = '';
      if (image) {
        console.log('🖼️ Uploading image to Cloudinary:', image.originalname);
        const uploadFromBuffer = (): Promise<any> =>
          new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'categories' },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              },
            );
            streamifier.createReadStream(image.buffer).pipe(uploadStream);
          });

        const upload = await uploadFromBuffer();
        console.log('✅ Image Uploaded:', upload.secure_url);
        imageUrl = upload.secure_url;
      }

      // Generate slug from name
      const slug = slugify(createDto.name, { lower: true, strict: true });
      console.log('🔗 Generated Slug:', slug);

      // Save category to DB
      const category = await this.categoryModel.create({
        ...createDto,
        slug,
        image: imageUrl,
      });

      console.log('🟢 Category saved to DB:', category._id);
      return category;
    } catch (error) {
      console.error('[Category Create Error]', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll() {
    return this.categoryModel.find();
  }

  async findById(id: string) {
    return this.categoryModel.findById(id);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    let imageUrl;

    if (dto.image) {
      // Upload base64 image string to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${dto.image}`,
        {
          folder: 'categories',
        },
      );
      imageUrl = uploadResult.secure_url;
    }

    const updateData = {
      ...dto,
      ...(imageUrl && { image: imageUrl }),
    };

    const updated = await this.categoryModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Category not found');

    return updated;
  }

  async delete(id: string) {
    const deleted = await this.categoryModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Category not found');
    return deleted;
  }
  async findBySlug(slug: string) {
    const category = await this.categoryModel.findOne({ slug });

    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    return category;
  }
}

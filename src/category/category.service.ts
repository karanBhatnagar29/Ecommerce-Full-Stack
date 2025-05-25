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

  async create(createDto: CreateCategoryDto, image?: Express.Multer.File) {
    try {
      const existing = await this.categoryModel.findOne({
        name: createDto.name,
      });
      if (existing) {
        throw new Error('Category already exists');
      }

      let imageUrl = '';
      if (image) {
        const uploadFromBuffer = (): Promise<any> => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'categories' },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              },
            );
            streamifier.createReadStream(image.buffer).pipe(uploadStream);
          });
        };

        const upload = await uploadFromBuffer();
        imageUrl = upload.secure_url;
      }

      const category = await this.categoryModel.create({
        ...createDto,
        image: imageUrl,
      });

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
}

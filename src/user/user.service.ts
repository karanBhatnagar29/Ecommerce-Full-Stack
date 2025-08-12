import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/updateUser-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  //get user all
  async getAllUsers() {
    return await this.userModel.find();
  }
  //get user by id
  async getUserById(id: string) {
    const user = await this.userModel.findById(id).lean();
    if (!user) return null;

    return {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    };
  }

  // update user
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
  }
}

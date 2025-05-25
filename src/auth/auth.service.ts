import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from '../user/dto/signUp.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '../user/dto/login.dto';
import { User, UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  //signup
  async signUp(signUpDto: SignupDto) {
    const { email, password, address, role } = signUpDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      email,
      password: hashedPassword,
      address,
      role,
    });
    await user.save();

    return {
      message: 'Signup success',
      user,
    };
  }
  //Login

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const exisitingUser = await this.userModel.findOne({ email });

    if (!exisitingUser) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      exisitingUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const payload = {
      email: exisitingUser.email,
      sub: exisitingUser._id,
      role: exisitingUser.role, // ✅ Include role in the token
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        email: exisitingUser.email,
        role: exisitingUser.role, // Optional: include in response if you want
      },
    };
  }
}

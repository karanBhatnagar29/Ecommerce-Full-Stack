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
import { CompleteProfileDto } from './dto/complete-profile.dto';

@Injectable()
export class AuthService {
  private otpStore = new Map<string, string>();
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

  // ✨ 1. Request OTP
  async requestOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(phone, otp);
    setTimeout(() => this.otpStore.delete(phone), 5 * 60 * 1000); // Expire OTP after 5 min

    // TODO: Send OTP via SMS here using service like Twilio, Fast2SMS
    console.log(`OTP for ${phone}: ${otp}`);

    return { message: 'OTP sent successfully' };
  }

  // ✨ 2. Verify OTP
  async verifyOtp(phone: string, otp: string) {
    const validOtp = this.otpStore.get(phone);
    if (validOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    let user = await this.userModel.findOne({ phone });

    // Create new user if doesn't exist
    if (!user) {
      user = new this.userModel({ phone, role: 'user' });
      await user.save();
    }

    const token = this.jwtService.sign({
      sub: user._id,
      phone: user.phone,
      role: user.role,
    });

    const isProfileComplete = !!user.email && !!user.address;

    return {
      token,
      isProfileComplete,
    };
  }

  // You will need to extract `userId` from the JWT
  async completeProfile(userId: string, dto: CompleteProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    user.username = dto.username;
    user.email = dto.email;
    user.address = dto.address;

    await user.save();

    return { message: 'Profile updated successfully', user };
  }
}

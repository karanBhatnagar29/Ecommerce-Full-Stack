import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private otpStore = new Map<string, string>();
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ✨ 1. Request OTP
  async requestOtp(email: string) {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(email, otp);
    setTimeout(() => this.otpStore.delete(email), 5 * 60 * 1000); // 5 minutes

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('GMAIL_USER'),
        pass: this.configService.get('GMAIL_PASS'),
      },
    });

    const mailOptions = {
      from: `"Zesty Crops" <${this.configService.get('GMAIL_USER')}>`,
      to: email,
      subject: 'Your OTP for Login',
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return { message: 'OTP sent to email successfully' };
  }

  // ✨ 2. Verify OTP
  async verifyOtp(email: string, otp: string) {
    const validOtp = this.otpStore.get(email);
    if (validOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    let user = await this.userModel.findOne({ email });

    if (!user) {
      user = new this.userModel({ email, role: 'user' });
      await user.save();
    }

    const token = this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    });

    const isProfileComplete = !!user.username && !!user.address;

    return {
      token,
      isProfileComplete,
      user,
    };
  }

  // You will need to extract `userId` from the JWT
  async completeProfile(userId: string, dto: CompleteProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    user.username = dto.username;
    user.address = dto.address;

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.userModel.findOne({ email: dto.email });
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
      user.email = dto.email;
    }

    await user.save();

    return {
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    };
  }
}

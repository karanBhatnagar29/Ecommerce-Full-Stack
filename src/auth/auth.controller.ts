import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from '../user/dto/signUp.dto';
import { LoginDto } from '../user/dto/login.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //signup
  @Post('signup')
  async signUp(@Body() signUpDto: SignupDto) {
    return this.authService.signUp(signUpDto);
  }

  //   Login

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('request-otp')
  requestOtp(@Body('phone') phone: string) {
    return this.authService.requestOtp(phone);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: { phone: string; otp: string }) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }
  @Put('complete-profile')
  @UseGuards(AuthGuard('jwt'))
  async completeProfile(@Req() req, @Body() dto: CompleteProfileDto) {
    const userId = req.user.userId; // ✅ not `sub`
    return this.authService.completeProfile(userId, dto);
  }
}

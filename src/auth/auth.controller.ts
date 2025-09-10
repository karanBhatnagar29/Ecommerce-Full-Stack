import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ Request OTP
  @Post('request-otp')
  requestOtp(@Body('email') email: string) {
    return this.authService.requestOtp(email);
  }

  // ✅ Verify OTP (via email)
  @Post('verify-otp')
  verifyOtp(@Body() dto: { email: string; otp: string }) {
    return this.authService.verifyOtp(dto.email, dto.otp);
  }

  // ✅ Complete Profile (requires JWT)
  @Put('complete-profile')
  @UseGuards(AuthGuard('jwt'))
  async completeProfile(@Req() req, @Body() dto: CompleteProfileDto) {
    const userId = req.user.userId; // your JwtStrategy maps this as `userId`, not `sub`
    return this.authService.completeProfile(userId, dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req) {
    return req.user; // already has { userId, email, role }
  }
}

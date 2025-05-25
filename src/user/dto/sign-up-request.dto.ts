import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

export class SignupRequestDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsPhoneNumber(undefined) // undefined lets validator detect country code automatically or specify 'IN', 'US' etc.
  phone?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password: string;
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp: string;
}

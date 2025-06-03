import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CompleteProfileDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  address: string;
}

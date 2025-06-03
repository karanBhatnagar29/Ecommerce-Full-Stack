import { IsPhoneNumber } from 'class-validator';

export class RequestOtpDto {
  @IsPhoneNumber('IN') // or 'ZZ' for any region
  phone: string;
}

import { IsEmail, IsMobilePhone, IsNumber, IsString, IsUrl } from 'class-validator';

export class CreatePaymentLinkDto {
  @IsNumber()
  amount: number;

  currency: string;

  @IsString()
  description: string;

  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsMobilePhone('en-IN') // Assuming the phone number format is for India, adjust the locale ('en-IN') as per your requirement
  customerContact: string;

  @IsUrl()
  callbackUrl: string;

  @IsString()
  callbackMethod: string;
}

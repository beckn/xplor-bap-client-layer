import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class VerifyPaymentDto {
  @IsOptional()
  @IsString()
  order_id?: string;

  @IsString()
  @IsNotEmpty()
  razorpay_order_id: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsOptional()
  payment_id?: string;

  payment_link_reference_id: string;
  @IsOptional()
  @IsString()
  payment_link_status: string;
}

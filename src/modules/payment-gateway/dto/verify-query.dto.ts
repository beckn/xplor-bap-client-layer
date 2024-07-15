import { IsString } from 'class-validator';

export class VerifyPaymentQueryDto {
  @IsString()
  razorpay_payment_id: string;

  @IsString()
  razorpay_payment_link_id: string;

  @IsString()
  razorpay_payment_link_reference_id: string;

  @IsString()
  razorpay_payment_link_status: string;

  @IsString()
  razorpay_signature: string;
}

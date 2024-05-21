// Data Transfer Object (DTO) for verifying OTP (One-Time Password)
import { IsOptional } from 'class-validator';

export class VerifyOtpDto {
  // Optional key field used to identify the user or operation for OTP verification
  @IsOptional()
  key: string;

  // Optional OTP field for verification
  @IsOptional()
  otp: string;

  @IsOptional()
  deviceId?: string;

  @IsOptional()
  targetLanguageCode?: string;
}

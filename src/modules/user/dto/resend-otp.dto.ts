/**
 * Data Transfer Object (DTO) for resending OTP (One-Time Password).
 * Includes a field for the key associated with the OTP, which is used to identify the user or operation.
 */
import { IsOptional } from 'class-validator';

export class ResendOtpDto {
  // Optional key field used to identify the user or operation for OTP resending
  @IsOptional()
  key: string;
}

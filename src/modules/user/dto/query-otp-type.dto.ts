import { IsEnum, IsOptional } from 'class-validator';
import OTP_TYPE from '../../../common/enums/otp-type';

export class QueryOtpTypeDto {
  @IsOptional()
  @IsEnum(OTP_TYPE)
  otpType?: OTP_TYPE;
}

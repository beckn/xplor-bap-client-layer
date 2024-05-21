import { IsOptional, IsString } from 'class-validator';
// import { DEVICE_ERROR_MESSAGES } from '../../constants/error-message';

export class DeviceIdDto {
  // Latitude
  @IsString()
  // @IsNotEmpty({ message: DEVICE_ERROR_MESSAGES.DEVICE_ID_REQUIRED })
  @IsOptional()
  deviceId: string;
}

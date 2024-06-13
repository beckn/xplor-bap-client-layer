import { IsOptional, IsString } from 'class-validator';

export class DeviceIdDto {
  @IsString()
  // @IsNotEmpty({ message: DEVICE_ERROR_MESSAGES.DEVICE_ID_REQUIRED })
  @IsOptional()
  deviceId: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class QueryDeviceIdDto {
  @IsString({ message: 'device ID must be a string' })
  @IsNotEmpty({ message: 'device ID is required' })
  deviceId: string;
}

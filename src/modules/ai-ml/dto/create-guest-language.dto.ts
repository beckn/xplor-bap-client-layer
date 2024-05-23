import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGuestLanguageDto {
  @ApiProperty({ description: 'The user device ID', example: 'abc123' })
  @IsString({ message: 'device ID must be a string' })
  @IsNotEmpty({ message: 'device ID is required' })
  deviceId: string;

  @ApiProperty({ description: 'The language code', example: 'en-US' })
  @IsString({ message: 'Language code must be a string' })
  @IsNotEmpty({ message: 'Language code is required' })
  languageCode: string;
}

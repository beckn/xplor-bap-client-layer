import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchRequestDto {
  @IsOptional({ message: 'searchQuery should not be empty' })
  @IsString({ message: ' searchQuery must be string' })
  searchQuery: string;

  @IsNotEmpty({ message: 'deviceId should not be empty' })
  @IsString({ message: ' deviceId must be string' })
  deviceId: string;

  @IsOptional()
  @IsArray()
  itemIds: string[];

  @IsOptional()
  @IsArray()
  providerIds: string[];
}

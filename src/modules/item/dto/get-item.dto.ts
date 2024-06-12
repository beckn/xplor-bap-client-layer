import { IsNotEmpty, IsString } from 'class-validator';

export class QueryItemDto {
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsNotEmpty()
  @IsString()
  itemId: string;
}

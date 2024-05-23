import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class SelectRequestDto {
  @IsArray()
  @IsString({ each: true })
  itemsId: string[];

  @IsNotEmpty()
  @IsString()
  providerId: string;
}

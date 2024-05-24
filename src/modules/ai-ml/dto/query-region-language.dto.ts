import { IsNotEmpty, IsString } from 'class-validator';

export class QueryRegionLanguageDto {
  @IsNotEmpty()
  @IsString()
  region: string;
}

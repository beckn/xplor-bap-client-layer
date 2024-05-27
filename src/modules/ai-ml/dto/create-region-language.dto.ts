import { IsArray, IsNotEmpty, IsString, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class Language {
  @IsNotEmpty()
  @IsString()
  language: string;

  @IsNotEmpty()
  @IsString()
  percentage: string;
}

export class CreateRegionLanguageDto {
  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Language)
  languages: Language[];
}

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TranslateDto {
  @IsNotEmpty()
  @IsString()
  sourceLanguage: string;

  @IsNotEmpty()
  @IsString()
  targetLanguage: string;

  @IsNotEmpty()
  content: any;

  @IsOptional()
  @IsArray()
  excluded_keys: string[];

  @IsOptional()
  useAsync: boolean;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class TranslateDto {
  @IsNotEmpty()
  @IsString()
  sourceLanguage: string;

  @IsNotEmpty()
  @IsString()
  targetLanguage: string;

  @IsNotEmpty()
  content: any;
}

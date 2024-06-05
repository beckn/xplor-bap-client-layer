import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ItemTranslateDto {
  @IsNotEmpty()
  @IsString()
  sourceLanguage: string;

  @IsNotEmpty()
  @IsString()
  targetLanguage: string;

  @IsNotEmpty()
  @IsString()
  content: any;

  @IsNotEmpty()
  @IsString()
  excluded_keys: string[];

  @IsOptional()
  useAsync: boolean;

  constructor(data: Partial<ItemTranslateDto>) {
    this.sourceLanguage = data.sourceLanguage;
    this.targetLanguage = data.targetLanguage;
    this.content = data.content;
    this.excluded_keys = data.excluded_keys || [];
    this.useAsync = data.useAsync ?? false;
  }
}

import { PartialType } from '@nestjs/swagger';
import { TranslateDto } from './translate.language.dto';

export class UpdateTranslateDto extends PartialType(TranslateDto) {}

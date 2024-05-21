import { IsNotEmpty } from 'class-validator';

export class TranslateDto {
  @IsNotEmpty()
  text: string | any;

  @IsNotEmpty()
  from_ln: string;

  @IsNotEmpty()
  to_ln: string;
}

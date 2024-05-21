import { IsNotEmpty, IsString } from 'class-validator';

export class ResetMpinDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  mPin: string;
}

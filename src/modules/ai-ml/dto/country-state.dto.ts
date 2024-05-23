import { IsNotEmpty, IsString } from 'class-validator';

export class CountryAndStateDto {
  // State
  @IsNotEmpty()
  @IsString()
  state: string;

  // Country
  @IsNotEmpty()
  @IsString()
  country: string;
}

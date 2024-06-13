import { IsNotEmpty, IsString } from 'class-validator';

export class RateOrderDto {
  @IsNotEmpty()
  @IsString()
  rating: string;

  @IsNotEmpty()
  @IsString()
  review: string;
}

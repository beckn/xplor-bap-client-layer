import { IsNotEmpty, IsString } from 'class-validator';

export class LatLongDto {
  // Latitude
  @IsString()
  @IsNotEmpty()
  lat: string;

  // Longitude
  @IsString()
  @IsNotEmpty()
  long: string;
}

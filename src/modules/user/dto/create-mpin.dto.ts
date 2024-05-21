import { IsOptional } from 'class-validator';

export class CreateMPinDto {
  @IsOptional()
  mPin: string;
}

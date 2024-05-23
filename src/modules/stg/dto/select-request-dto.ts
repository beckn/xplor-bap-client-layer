import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SelectRequestDto {
  @IsArray()
  @IsString({ each: true })
  items_id: string[];

  @IsOptional()
  @IsString()
  domain: string;

  @IsNotEmpty()
  @IsString()
  provider_id: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fulfillment_id?: string;

  @IsNotEmpty()
  @IsString()
  transaction_id: string;
}

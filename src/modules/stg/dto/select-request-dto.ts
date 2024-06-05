import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SelectRequestDto {
  @IsNotEmpty({ message: 'transaction_id should not be empty' })
  @IsString({ message: ' transaction_id must be string' })
  transaction_id: string;

  @IsNotEmpty({ message: 'domain should not be empty' })
  @IsString({ message: 'domain must be string' })
  domain: string;

  @IsNotEmpty({ message: 'item_id should not be empty' })
  @IsString({ message: 'item_id must be string' })
  item_id: string;

  @IsNotEmpty({ message: 'provider_id should not be empty' })
  @IsString({ message: 'provider_id must be string' })
  provider_id: string;

  @IsOptional()
  deviceId?: string;
}

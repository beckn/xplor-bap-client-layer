import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InitRequestDto {
  @IsNotEmpty({ message: 'Transaction ID is required' })
  @IsString({ message: 'Transaction ID must be a string' })
  transaction_id: string;

  @IsNotEmpty({ message: 'Item ID is required' })
  @IsString({ message: 'Item ID must be a string' })
  item_id: string;

  @IsNotEmpty({ message: 'Domain is required' })
  @IsString({ message: 'Domain must be a string' })
  domain: string;

  @IsNotEmpty({ message: 'Provider ID is required' })
  @IsString({ message: 'Provider ID must be a string' })
  provider_id: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  billing_address?: any;
}

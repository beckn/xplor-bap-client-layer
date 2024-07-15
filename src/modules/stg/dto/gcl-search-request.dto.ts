import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GclSearchRequestDto {
  @IsNotEmpty({ message: 'transaction_id should not be empty' })
  @IsString({ message: ' transaction_id must be string' })
  transaction_id: string;

  @IsNotEmpty({ message: 'domain should not be empty' })
  @IsString({ message: 'domain must be string' })
  domain: string;

  @IsNotEmpty({ message: 'Query should not be empty' })
  @IsString({ message: 'Query must be string' })
  query: string;

  @IsOptional()
  deviceId?: string;
}

import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class ContextDto {
  @IsNotEmpty({ message: 'Transaction ID is required' })
  @IsString({ message: 'Transaction ID must be a string' })
  transaction_id: string;

  @IsOptional()
  @IsString({ message: 'Bap Uri must be a string' })
  bap_uri: string;

  @IsNotEmpty({ message: 'Domain should not be empty' })
  @IsArray({ message: ' Domain must be string' })
  domain: Array<string>;
}

export class MessageDto {
  searchQuery: string;
}

export class SearchRequestDto {
  @IsOptional()
  deviceId?: string;

  @IsNotEmpty({ message: 'Context is required' })
  @IsObject({ message: 'Context must be a object' })
  context: ContextDto;

  @IsNotEmpty({ message: 'Message is required' })
  @IsObject({ message: 'Message must be a object' })
  message: MessageDto;
}

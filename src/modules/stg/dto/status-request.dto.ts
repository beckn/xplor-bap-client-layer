import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MessageDto {
  @IsNotEmpty({ message: 'Order id is required' })
  @IsString({ message: 'Order id must be a string' })
  order_id: string;
}

export class ContextDto {
  @IsNotEmpty({ message: 'Transaction ID is required' })
  @IsString({ message: 'Transaction ID must be a string' })
  transaction_id: string;

  @IsOptional()
  @IsString({ message: 'Order id must be a string' })
  domain: string;
}
export class StatusRequestDto {
  @IsNotEmpty({ message: 'Transaction ID is required' })
  @IsString({ message: 'Transaction ID must be a string' })
  transaction_id: string;

  @IsNotEmpty({ message: 'Item ID is required' })
  @IsString({ message: 'Item ID must be a string' })
  item_id: string;

  @IsOptional()
  @IsString({ message: 'Order id must be a string' })
  domain: string;

  @IsNotEmpty({ message: 'Order id is required' })
  @IsString({ message: 'Order id must be a string' })
  order_id: string;

  @IsOptional()
  deviceId?: string;
}

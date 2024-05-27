import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

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
  @IsNotEmpty({ message: 'Context is required' })
  @IsObject({ message: 'Context must be a object' })
  context: ContextDto;

  @IsNotEmpty({ message: 'Message is required' })
  @IsObject({ message: 'Message must be a object' })
  message: MessageDto;
}

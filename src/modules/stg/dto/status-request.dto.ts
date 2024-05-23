import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StatusRequestDto {
  @IsNotEmpty({ message: 'Order id is required' })
  @IsString({ message: 'Order id must be a string' })
  order_id: string;

  @IsOptional()
  @IsString({ message: 'Order id must be a string' })
  domain: string;

  @IsNotEmpty({ message: 'Order id is required' })
  @IsString({ message: 'Order id must be a string' })
  transaction_id: string;
}

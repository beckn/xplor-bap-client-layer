import { IsNotEmpty, IsString } from 'class-validator';

export class CancelRequestDto {
  @IsNotEmpty({ message: 'Order Id should not be empty' })
  @IsString({ message: 'Order Id must be a string' })
  order_id: string;

  @IsNotEmpty({ message: 'transaction Id should not be empty' })
  @IsString({ message: 'transaction Id must be a string' })
  transaction_id: string;

  @IsNotEmpty({ message: 'Item Id should not be empty' })
  @IsString({ message: 'Item Id must be a string' })
  item_id: string;

  @IsNotEmpty({ message: 'Cancellation Reason Id should not be empty' })
  @IsString({ message: 'Cancellation Reason Id must be a string' })
  cancellation_reason_id: string;

  @IsNotEmpty({ message: 'domain should not be empty' })
  @IsString({ message: 'domain must be string' })
  domain: string;
}

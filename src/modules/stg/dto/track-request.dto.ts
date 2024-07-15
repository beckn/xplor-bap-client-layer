import { IsNotEmpty, IsString } from 'class-validator';

export class TrackRequestDto {
  @IsNotEmpty({ message: 'Order Id should not be empty' })
  @IsString({ message: 'Order Id must be a string' })
  order_id: string;

  @IsNotEmpty({ message: 'transaction Id should not be empty' })
  @IsString({ message: 'transaction Id must be a string' })
  transaction_id: string;

  @IsNotEmpty({ message: 'Item Id should not be empty' })
  @IsString({ message: 'Item Id must be a string' })
  item_id: string;

  @IsNotEmpty({ message: 'Callback Url should not be empty' })
  @IsString({ message: 'Callback Url must be a string' })
  callback_url: string;

  @IsNotEmpty({ message: 'domain should not be empty' })
  @IsString({ message: 'domain must be string' })
  domain: string;
}

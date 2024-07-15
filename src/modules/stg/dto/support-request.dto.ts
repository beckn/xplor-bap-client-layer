import { IsNotEmpty, IsString } from 'class-validator';

export class SupportRequestDto {
  @IsNotEmpty({ message: 'Order Id should not be empty' })
  @IsString({ message: 'Order Id must be a string' })
  order_id: string;

  @IsNotEmpty({ message: 'transaction Id should not be empty' })
  @IsString({ message: 'transaction Id must be a string' })
  transaction_id: string;

  @IsNotEmpty({ message: 'Item Id should not be empty' })
  @IsString({ message: 'Item Id must be a string' })
  item_id: string;

  @IsNotEmpty({ message: 'Ref Id not be empty' })
  @IsString({ message: 'Ref Id must be a string' })
  ref_id: string;

  @IsNotEmpty({ message: 'domain should not be empty' })
  @IsString({ message: 'domain must be string' })
  domain: string;
}

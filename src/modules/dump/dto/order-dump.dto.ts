import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { OrderStatus } from '../../../common/constants/stg-constants';

export class OrderDto {
  @IsNotEmpty()
  order_id: string;

  @IsNotEmpty()
  user_id: string;

  @IsNotEmpty()
  domain: string;

  @IsNotEmpty()
  transaction_id: string;

  @IsNotEmpty()
  provider: Record<string, any>; // Consider defining a more specific type if possible

  @IsNotEmpty()
  item_id: string;

  @IsNotEmpty()
  internal_item_id: string;

  @IsNotEmpty()
  billing: Record<string, any>;

  @IsNotEmpty()
  payments: Record<string, any>;

  @IsNotEmpty()
  fulfillment: Record<string, any>;

  @IsNotEmpty()
  quote: Record<string, any>;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

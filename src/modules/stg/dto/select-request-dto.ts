import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItem {
  @IsArray()
  @IsNotEmpty()
  items_id: string[];

  @IsString()
  @IsNotEmpty()
  provider_id: string;

  @IsOptional()
  @IsArray()
  fulfillment_id?: string[];
}

class Message {
  @ValidateNested()
  @Type(() => OrderItem)
  order: OrderItem;
}

class Context {
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsString()
  @IsOptional()
  message_id: string;

  @IsOptional()
  ttl: string;
}

export class SelectRequestDto {
  @ValidateNested()
  @Type(() => Context)
  context: Context;

  @ValidateNested()
  @Type(() => Message)
  message: Message;
}

import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

/**
 * Data Transfer Object (DTO) for the context of a search request.
 * Validates the context information required for a search operation.
 */
export class ContextDto {
  @IsNotEmpty({ message: 'Domain is required' })
  @IsString({ message: 'Domain must be a string' })
  domain: string;
  @IsNotEmpty({ message: 'Transaction ID is required' })
  @IsString({ message: 'Transaction ID must be a string' })
  transaction_id: string;

  @IsNotEmpty({ message: 'Message ID is required' })
  @IsString({ message: 'Message ID must be a string' })
  message_id: string;

  @IsNotEmpty({ message: 'TTL is required' })
  @IsString({ message: 'TTL must be a string' })
  ttl: string;
}

class Fulfillment {
  @IsNotEmpty({ message: 'id is required' })
  @IsString({ message: 'id must be a string' })
  id: string;
}

export class FulfillmentsDto {
  @ArrayNotEmpty({ message: 'Fulfillments cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => Fulfillment)
  fulfillment: Fulfillment[];
}

class BillingDto {
  @IsNotEmpty({ message: 'id is required' })
  @IsString({ message: 'id must be a string' })
  id: string;
}

class OrderItem {
  @ValidateNested()
  @Type(() => BillingDto)
  billing: BillingDto;

  @ValidateNested()
  @Type(() => FulfillmentsDto)
  fulfillments: FulfillmentsDto;

  @IsArray()
  @IsString({ each: true })
  items_id: string[];

  @IsString()
  provider_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentStatusDto)
  payments: PaymentStatusDto[];
}

export class ParamsDto {
  @IsOptional()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  bank_code?: string;

  @IsOptional()
  @IsString()
  bank_account_number?: string;

  @IsOptional()
  @IsString()
  bank_account_name?: string;
}
class PaymentStatusDto {
  @ValidateNested()
  @Type(() => ParamsDto)
  params: ParamsDto;

  @IsString()
  status?: string;
}

// Alternatively, if you prefer a single DTO for the entire structure:
export class PaymentDto {
  @IsString()
  params: {
    amount: string;
    currency: string;
  };

  @IsString()
  status: string;
}
class MessageDto {
  @ValidateNested()
  @Type(() => OrderItem)
  order: OrderItem;
}

/**
 * Data Transfer Object (DTO) for a search request.
 * Validates the search request information required for an Confirm operation.
 */
export class ConfirmRequestDto {
  @IsNotEmpty({ message: 'Context is required' })
  @IsObject({ message: 'Context must be a object' })
  context: ContextDto;

  @IsNotEmpty({ message: 'Message is required' })
  @IsObject({ message: 'Message must be a object' })
  message: MessageDto;
}

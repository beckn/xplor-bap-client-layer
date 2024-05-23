import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

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

export class ConfirmRequestDto {
  @IsArray()
  @IsString({ each: true })
  items_id: string[];

  @IsString()
  transaction_id: string;

  @IsString()
  domain: string;

  @IsString()
  provider_id: string;

  @ValidateNested()
  @Type(() => BillingDto)
  billing: BillingDto;

  @ValidateNested()
  @Type(() => FulfillmentsDto)
  fulfillments: FulfillmentsDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentStatusDto)
  payments: PaymentStatusDto[];
}

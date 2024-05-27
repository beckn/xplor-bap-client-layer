import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

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

class BillingDto {
  @IsNotEmpty({ message: 'id is required' })
  @IsString({ message: 'id must be a string' })
  id: string;

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  email: string;

  @IsNotEmpty({ message: 'Address is required' })
  @IsString({ message: 'Address must be a string' })
  address: string;

  @IsNotEmpty({ message: 'Gender is required' })
  @IsString({ message: 'Gender must be a string' })
  gender: string;

  @IsNotEmpty({ message: 'Age is required' })
  @IsString({ message: 'Age must be a string' })
  age: string;
}

class Descriptor {
  @IsNotEmpty({ message: 'Code is required' })
  @IsString({ message: 'Code must be a string' })
  code: string;

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;
}

class List {
  @ValidateNested()
  @Type(() => Descriptor)
  descriptor: Descriptor;

  @IsNotEmpty({ message: 'Value is required' })
  @IsString({ message: 'Value must be a string' })
  value: string;
}

class Tag {
  @ValidateNested()
  @Type(() => Descriptor)
  descriptor: Descriptor;

  @ArrayNotEmpty({ message: 'List cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => List)
  list: List[];

  @IsOptional()
  @IsBoolean({ message: 'Display must be a boolean' })
  display?: boolean;
}

class Contact {
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString({ message: 'Phone must be a string' })
  phone: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  email: string;
}

class Person {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Age is required' })
  @IsString({ message: 'Age must be a string' })
  age?: string;

  @IsNotEmpty({ message: 'Gender is required' })
  @IsString({ message: 'Gender must be a string' })
  gender: string;

  @IsOptional()
  @ArrayNotEmpty({ message: 'Tags cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => Tag)
  tags?: Tag[];
}

class Customer {
  @ValidateNested()
  @Type(() => Person)
  person: Person;

  @ValidateNested()
  @Type(() => Contact)
  contact: Contact;
}

class Fulfillment {
  @IsOptional()
  @IsNotEmpty({ message: 'id is required' })
  @IsString({ message: 'id must be a string' })
  id?: string;
  @ValidateNested()
  @Type(() => Customer)
  customer: Customer;
}

export class FulfillmentsDto {
  @ArrayNotEmpty({ message: 'Fulfillments cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => Fulfillment)
  fulfillment: Fulfillment[];
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
}

class MessageDto {
  @ValidateNested()
  @Type(() => OrderItem)
  order: OrderItem;
}

/**
 * Data Transfer Object (DTO) for a search request.
 * Validates the search request information required for an init operation.
 */
export class InitRequestDto {
  @IsNotEmpty({ message: 'Context is required' })
  @IsObject({ message: 'Context must be a object' })
  context: ContextDto;

  @IsNotEmpty({ message: 'Message is required' })
  @IsObject({ message: 'Message must be a object' })
  message: MessageDto;
}

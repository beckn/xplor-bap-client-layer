import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

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

class Fulfillment {
  @IsOptional()
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

export class InitRequestDto {
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

  @IsOptional()
  @IsString({ message: 'domain must be a string' })
  domain: string;

  @IsString()
  transaction_id: string;
}

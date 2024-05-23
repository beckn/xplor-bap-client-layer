import { IsString, IsNotEmpty, IsObject, IsOptional, IsArray } from 'class-validator';

export class CreateDumpDto {
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsArray()
  domains?: Array<string>;

  @IsString()
  @IsNotEmpty()
  device_id: string;

  @IsString()
  @IsNotEmpty()
  request_type: string;

  @IsString()
  @IsNotEmpty()
  message_id: string;

  @IsObject()
  @IsNotEmpty()
  context: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  message: Record<string, any>;

  constructor(partial: Partial<CreateDumpDto>) {
    Object.assign(this, partial);
  }
}

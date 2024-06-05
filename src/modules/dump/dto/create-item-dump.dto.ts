import { IsString, IsNotEmpty, ValidateNested, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class DescriptorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  // @IsNotEmpty()
  long_desc: string;

  @IsOptional()
  // @IsNotEmpty()
  short_desc: string;

  @IsArray()
  images: string[];

  constructor(data: Partial<DescriptorDto>) {
    this.name = data.name;
    this.long_desc = data.long_desc;
    this.short_desc = data.short_desc;
    this.images = data.images || [];
  }
}

export class PriceDto {
  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateItemDumpDto {
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsString()
  @IsNotEmpty()
  item_id: string;

  @IsString()
  @IsNotEmpty()
  domain: string;

  @ValidateNested()
  @Type(() => DescriptorDto)
  descriptor: DescriptorDto;

  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;

  @IsString()
  @IsNotEmpty()
  provider_id: string;

  @IsString()
  @IsNotEmpty()
  provider: DescriptorDto;

  constructor(data: Partial<CreateItemDumpDto>) {
    this.transaction_id = data.transaction_id;
    this.domain = data.domain;
    this.item_id = data.item_id;
    this.descriptor = data.descriptor;
    this.price = data.price;
    this.provider_id = data.provider_id;
    this.provider = data.provider;
  }
}

export class BulkCreateItemDumpDto {
  @ValidateNested({ each: true })
  @Type(() => CreateItemDumpDto)
  items: CreateItemDumpDto[];
}

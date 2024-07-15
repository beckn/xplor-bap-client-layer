import { IsString, IsNotEmpty, ValidateNested, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Tag } from '../../stg/schema/gcl-catalogue.items.interface';

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

export class DescriptorDTO {
  @IsString()
  code: string;

  @IsString()
  name: string;
}

export class ListDTO {
  @ValidateNested()
  @Type(() => DescriptorDTO)
  descriptor: DescriptorDTO;

  @IsString()
  value: string;
}

export class ContentMetadataDTO {
  @ValidateNested()
  @Type(() => DescriptorDTO)
  descriptor: DescriptorDTO;

  @ValidateNested({ each: true })
  @Type(() => ListDTO)
  list: ListDTO[];

  @IsBoolean()
  display: boolean;
}

export class CreateItemDumpDto {
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsString()
  @IsNotEmpty()
  item_id: string;

  @IsString()
  @IsOptional()
  bpp_id: string;

  @IsString()
  @IsOptional()
  bpp_uri: string;

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

  @IsString()
  @IsNotEmpty()
  rating: string;

  @IsString()
  @IsNotEmpty()
  rateable: boolean;

  @IsString()
  @IsNotEmpty()
  creator: DescriptorDto;

  // @IsOptional()
  // @Type(() => ContentMetadataDTO)
  // tags: ContentMetadataDTO[];

  @IsOptional()
  @Type(() => ContentMetadataDTO)
  tags: Tag[];

  constructor(data: Partial<CreateItemDumpDto>) {
    this.transaction_id = data.transaction_id;
    this.domain = data.domain;
    this.item_id = data.item_id;
    this.descriptor = data.descriptor;
    this.price = data.price;
    this.provider_id = data.provider_id;
    this.provider = data.provider;
    this.rating = data.rating;
    this.rateable = data.rateable;
    this.creator = data.creator;
    this.tags = data.tags;
    this.bpp_id = data.bpp_id;
    this.bpp_uri = data.bpp_uri;
  }
}

export class BulkCreateItemDumpDto {
  @ValidateNested({ each: true })
  @Type(() => CreateItemDumpDto)
  items: CreateItemDumpDto[];
}

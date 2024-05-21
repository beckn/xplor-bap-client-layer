// src/user/dto/create-kyc.dto.ts

// Importing necessary decorators from class-validator and class-transformer
import { IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Importing the ProviderDto for nested validation
import { ProviderDto } from './create-provider.dto';

// DTO for creating a new KYC record, which includes various personal and provider details
export class CreateKycDto {
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  walletId: string;

  @IsOptional()
  @IsString()
  dob: string;

  @Matches(/^[a-zA-Z]+$/, { message: 'Gender must contain only letters' })
  gender: string;

  @ValidateNested()
  @Type(() => ProviderDto)
  provider: ProviderDto;
}

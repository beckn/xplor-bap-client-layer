// src/user/dto/create-user.dto.ts

// Importing necessary decorators from class-validator and class-transformer
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateKycDto } from './create-kyc.dto';
import { Role } from '../../../common/enums/role';

// DTO for creating a new user, which includes various personal details and optional KYC information
export class CreateUserDto {
  @IsOptional()
  @IsBoolean()
  kycStatus?: boolean;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateKycDto)
  kyc: CreateKycDto;
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) for creating an e-auth record.
 * It includes properties like provider, code, scope, access_token, expires_in, and token_type.
 */
export class CreateEAuthDto {
  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  access_token?: string;

  @IsOptional()
  @IsString()
  expires_in?: string;

  @IsOptional()
  @IsString()
  token_type?: string;
}

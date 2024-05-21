// Import necessary decorators from class-validator for validation
import { IsOptional, IsString } from 'class-validator';

// Define a DTO for querying wallet information
export class WalletQueryDto {
  // Validate that walletId is optional and a string
  @IsOptional()
  @IsString()
  readonly walletId?: string;
}

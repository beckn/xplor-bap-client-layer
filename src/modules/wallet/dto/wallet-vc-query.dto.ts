// Import necessary decorators from class-validator for validation
import { IsOptional } from 'class-validator';

// Define a DTO for querying wallet verifiable credentials (VCs)
export class WalletVcQueryDto {
  // Validate that walletId is optional and a string
  @IsOptional()
  walletId: string;

  // Validate that vcId is optional and a number
  @IsOptional()
  vcId?: string;

  // Validate that category is optional and a string
  @IsOptional()
  category?: string;

  // Validate that searchQuery is optional and a string
  @IsOptional()
  searchQuery?: string;

  // Validate that tags is optional and an array of strings
  @IsOptional()
  tags?: string[];

  // Validate that page is optional and a number
  @IsOptional()
  page: number;

  // Validate that pageSize is optional and a number
  @IsOptional()
  pageSize: number;
}

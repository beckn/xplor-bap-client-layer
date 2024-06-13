// Import necessary decorators from class-validator for validation
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Define a DTO for querying user wallet files
export class GetUserWalletFilesQueryDto {
  // Validate that userId is a string and not empty
  @IsNotEmpty()
  @IsString()
  userId: string;

  // Validate that page is optional and a string
  @IsOptional()
  page: string;

  // Validate that pageSize is optional and a string
  @IsOptional()
  pageSize: string;
}

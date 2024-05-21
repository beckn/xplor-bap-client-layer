// Import necessary decorators from class-validator for validation
import { ArrayNotEmpty, ArrayUnique, IsArray, IsNotEmpty, IsString } from 'class-validator';

// Define a DTO for creating a file request in the wallet
export class CreateFileRequestDto {
  // Validate that userId is a string and not empty
  @IsNotEmpty()
  readonly userId: string;

  // Validate that fileType is a string and not empty
  @IsNotEmpty()
  @IsString()
  readonly fileType: string;

  // Validate that fileTags is an array, not empty, unique, and each element is a string
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  readonly fileTags: string[];

  // Validate that fileName is a string and not empty
  @IsNotEmpty()
  @IsString()
  readonly fileName: string;

  // Validate that metadata is a string and not empty
  @IsNotEmpty()
  @IsString()
  readonly metadata: string;
}

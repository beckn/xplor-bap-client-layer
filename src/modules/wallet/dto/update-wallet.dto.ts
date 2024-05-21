// Import necessary utilities from NestJS for creating a partial type
import { PartialType } from '@nestjs/mapped-types';
import { CreateWalletDto } from './create-wallet.dto';

// Define a DTO for updating a wallet, extending the CreateWalletDto with optional fields
export class UpdateWalletDto extends PartialType(CreateWalletDto) {}

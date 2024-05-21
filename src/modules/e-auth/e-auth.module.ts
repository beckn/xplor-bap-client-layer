// Import necessary decorators and services
import { EAuthService } from './e-auth.service';
import { EAuthController } from './e-auth.controller';
import { Module } from '@nestjs/common';

// Define the EAuthModule
@Module({
  imports: [],
  controllers: [EAuthController],
  providers: [EAuthService],
  exports: [EAuthService], // Export the EAuthService to be used in other modules
})
export class EAuthModule {}

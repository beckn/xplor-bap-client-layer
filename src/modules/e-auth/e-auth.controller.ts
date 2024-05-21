// Import necessary decorators, services, and DTOs
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { EAuthService } from './e-auth.service';

import { ExtractToken } from 'src/common/decorators/extract-token.decorator';

// Define the EAuthController with necessary routes and decorators
@ApiTags('E-auth')
@Controller({
  version: '1',
  path: 'e-auth',
})
export class EAuthController {
  constructor(private readonly eAuthService: EAuthService) {}

  // Route to get list of providers
  @Get()
  getProviders(@ExtractToken() token: string) {
    return this.eAuthService.getProviders(token);
  }
}

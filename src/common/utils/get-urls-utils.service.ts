import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// import { Endpoints } from '../constants/endpoint'; // Assuming 'endpoints' file path

/**
 * A service to get various URLs used across the application for eAuth, Wallet, and User services.
 */
@Injectable()
export class GetUrl extends ConfigService {
  // URLs from environment variables.
  coreServiceUrl = this.get('coreServiceUrl');
}

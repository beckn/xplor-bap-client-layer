import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { GetUrl } from './utils/get-urls-utils.service';
import { ResponsePayloadUtilsService } from './utils/response-payload.utils.service';
@Global()
@Module({
  // Import the UserModule to include user-related functionalities.
  imports: [{ module: HttpModule, global: true }],
  // Provide the GetUrl .
  providers: [GetUrl, ResponsePayloadUtilsService],
  // Export the GetUrl .
  exports: [GetUrl, ResponsePayloadUtilsService],
})
// Define the CommonModule class.
export class CommonModule {}

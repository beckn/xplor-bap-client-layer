import { Global, Module } from '@nestjs/common';
import { GetUrl } from './utils/get-urls-utils.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  // Import the UserModule to include user-related functionalities.
  imports: [{ module: HttpModule, global: true }],
  // Provide the GetUrl .
  providers: [GetUrl],
  // Export the GetUrl .
  exports: [GetUrl],
})
// Define the CommonModule class.
export class CommonModule {}

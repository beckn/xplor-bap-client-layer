// Import necessary modules and components from NestJS
import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DumpModule } from '../dump/dump.module';

// Define the UserModule with its controllers and providers
@Module({
  imports: [DumpModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

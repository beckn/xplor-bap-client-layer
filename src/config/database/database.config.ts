// Import necessary decorators and classes from NestJS and other libraries.
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';

// Decorate the class with @Injectable() to make it a provider that can be injected into other parts of the application.
@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  // Constructor to inject dependencies.
  constructor(private readonly configService: ConfigService) {}

  // Implement the createMongooseOptions method required by the MongooseOptionsFactory interface.
  // This method is called automatically by NestJS to configure the Mongoose module.
  createMongooseOptions(): MongooseModuleOptions {
    // Return the Mongoose module options, including the database URI obtained from the ConfigService.
    return {
      uri: this.configService.get<string>('databaseUrl'),
    };
  }
}

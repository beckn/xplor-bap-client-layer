import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import envValidation from '../../config/env/validation/env.validation';
import configuration from '../../config/env/env.config';
import * as Joi from 'joi';
import { CommonModule } from 'src/common/common.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: Joi.object(envValidation()),
      validationOptions: {
        abortEarly: false,
      },
    }),
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

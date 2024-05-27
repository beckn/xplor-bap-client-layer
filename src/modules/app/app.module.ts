import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envValidation from '../../config/env/validation/env.validation';
import configuration from '../../config/env/env.config';
import * as Joi from 'joi';
import { CommonModule } from 'src/common/common.module';
import { EAuthModule } from '../e-auth/e-auth.module';
import { StgModule } from '../stg/stg.module';
import { WalletModule } from '../wallet/wallet.module';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AiMlModule } from '../ai-ml/ai-ml.module';
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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    { module: CommonModule, global: true },
    EAuthModule,
    StgModule,
    WalletModule,
    UserModule,
    AiMlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

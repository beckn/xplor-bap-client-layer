import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import envValidation from '../../config/env/validation/env.validation';
import configuration from '../../config/env/env.config';
import { EAuthModule } from '../e-auth/e-auth.module';
import { StgModule } from '../stg/stg.module';
import { WalletModule } from '../wallet/wallet.module';
import { UserModule } from '../user/user.module';
import { AiMlModule } from '../ai-ml/ai-ml.module';
import { KafkaModule } from '../kafka/kafka.module';
import { CommonModule } from '../../common/common.module';
import { ItemModule } from '../item/item.module';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';

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
    KafkaModule.forRoot(),
    // ElasticSearchModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    { module: CommonModule, global: true },
    ScheduleModule.forRoot(),
    EAuthModule,
    StgModule,
    WalletModule,
    UserModule,
    AiMlModule,
    ItemModule,
    PaymentGatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

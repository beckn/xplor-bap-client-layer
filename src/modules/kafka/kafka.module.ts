// kafka.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaConsumerService } from './consumer/consumer.service';

@Module({
  imports: [ConfigModule],
  providers: [
    KafkaConsumerService,
    {
      provide: 'KAFKA_BROKERS',
      useFactory: (configService: ConfigService) => configService.get<string[]>('kafkaBrokers'),
      inject: [ConfigService],
    },
  ],
  exports: [KafkaConsumerService],
})
export class KafkaModule {
  static forRoot(): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: 'KAFKA_BROKERS',
          useFactory: (configService: ConfigService) => configService.get<string[]>('kafkaBrokers'),
          inject: [ConfigService],
        },
        KafkaConsumerService,
      ],
      exports: [KafkaConsumerService],
    };
  }
}

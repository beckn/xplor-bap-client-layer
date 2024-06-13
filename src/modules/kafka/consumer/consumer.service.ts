/* eslint-disable @typescript-eslint/no-unused-vars */
// kafka-consumer.service.ts
import { Injectable, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer;

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get('kafkaClientId'),
      brokers: this.configService.get('kafkaBrokers'),
    });
    this.consumer = this.kafka.consumer({ groupId: this.configService.get('kafkaGroupId') });
  }

  async initializeConsumer(topic: string) {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: topic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const receivedMessage = message.value.toString();
        this.logger.log('Received Message:', receivedMessage);
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}

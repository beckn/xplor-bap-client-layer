import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentGatewayController } from './payment-gateway.controller';
import { DumpModule } from '../dump/dump.module';

@Module({
  imports: [DumpModule],
  controllers: [PaymentGatewayController],
  providers: [PaymentGatewayService],
})
export class PaymentGatewayModule {}

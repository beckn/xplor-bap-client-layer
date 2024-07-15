import { Body, Controller, Get, Injectable, Logger, Post, Query } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { VerifyPaymentQueryDto } from './dto/verify-query.dto';

@Controller({ path: 'payment', version: '1' })
@Injectable()
export class PaymentGatewayController {
  private readonly logger: Logger = new Logger(PaymentGatewayController.name);

  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Post('/create-link')
  async createPaymentLink(@Body() createPaymentLink: CreatePaymentLinkDto) {
    this.logger.log('createPaymentLinkDto', createPaymentLink);

    return await this.paymentGatewayService.createPaymentLink(createPaymentLink);
  }
  @Get('/verify-payment')
  async VerifyPayment(@Query() verifyPaymentQuery: VerifyPaymentQueryDto) {
    this.logger.log(verifyPaymentQuery);
    return await this.paymentGatewayService.verifyPayment(verifyPaymentQuery);
  }
}

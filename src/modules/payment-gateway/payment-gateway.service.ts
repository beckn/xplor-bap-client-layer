import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { GetUrl } from '../../common/utils/get-urls-utils.service';
import { VerifyPaymentDto } from './dto/verify-order.dto';
import { VerifyPaymentQueryDto } from './dto/verify-query.dto';
import { OrderDumpService } from '../dump/service/order-dump.service';

@Injectable()
export class PaymentGatewayService {
  private readonly logger: Logger = new Logger(PaymentGatewayService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly getUrl: GetUrl,
    private readonly orderService: OrderDumpService,
  ) {}

  async createPaymentLink(createPaymentLinkDto: CreatePaymentLinkDto) {
    try {
      this.logger.log('createPaymentLinkDto', createPaymentLinkDto);

      const responseData: any = await this.httpService.axiosRef.post(this.getUrl.getPaymentLink, createPaymentLinkDto);
      this.logger.log('responseData', responseData?.data);
      const paymentResponsePayload = {
        payment_url: responseData?.data?.data['short_url'],
        status: responseData?.data?.data['status'],
        razorpay_order_id: responseData?.data?.data['id'],
      };
      return paymentResponsePayload;
    } catch (error) {
      this.logger.error('createPaymentLink Error: ', error);
    }
  }

  async verifyPayment(verifyPaymentQuery: VerifyPaymentQueryDto) {
    try {
      this.logger.log('verifyPaymentQuery', verifyPaymentQuery);
      // fetch order id from order service based on razorpay_payment_link_id
      const orderResponseFromDb = await this.orderService.findByKey(
        'paymentId',
        verifyPaymentQuery.razorpay_payment_link_id,
      );

      this.logger.log('orderResponseFromDb', orderResponseFromDb);
      const verifyPaymentPayload: VerifyPaymentDto = {
        order_id: orderResponseFromDb?._id,
        razorpay_order_id: verifyPaymentQuery.razorpay_payment_link_id,
        signature: verifyPaymentQuery.razorpay_signature,
        payment_id: verifyPaymentQuery.razorpay_payment_id,
        amount: Number(parseInt(orderResponseFromDb?.quote?.price?.value, 10)),
        currency: orderResponseFromDb?.quote?.price?.currency,
        payment_link_reference_id: verifyPaymentQuery.razorpay_payment_link_reference_id,
        payment_link_status: verifyPaymentQuery.razorpay_payment_link_status,
      };
      this.logger.log('verifyPaymentPayload', verifyPaymentPayload);

      const responseData: any = await this.httpService.axiosRef.post(this.getUrl.verifyPayment, verifyPaymentPayload);
      this.logger.log('responseData', responseData?.data);

      // update order status
      const updateOrderPayload = {
        paymentStatus: responseData?.data?.data?.paymentStatus,
      };
      const updateResponseFromDb = await this.orderService.update(orderResponseFromDb?._id, updateOrderPayload);
      this.logger.log('updateResponseFromDb: ', updateResponseFromDb);

      return responseData?.data;
    } catch (error) {
      this.logger.error('verifyPaymentDto Error: ', error);
    }
  }
}

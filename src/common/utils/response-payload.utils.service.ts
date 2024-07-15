import { Injectable, Logger } from '@nestjs/common';

import { DomainsEnum, xplorDomain } from '../constants/enums';
import { initConstants } from '../constants/stg-constants';
@Injectable()
export class ResponsePayloadUtilsService {
  private readonly logger = new Logger(ResponsePayloadUtilsService.name);
  scholarshipPayload(responseDto: any) {
    return {
      data: {
        transaction_id: responseDto?.context?.transaction_id,
        item_id: responseDto?.message?.order?.items[0]?.id,
        domain: responseDto?.context?.domain,
        action: responseDto?.context?.action,
        quote: responseDto?.message?.order?.quote,
      },
    };
  }

  coursePayload(responseDto: any) {
    return {
      data: {
        transaction_id: responseDto?.context?.transaction_id,
        item_id: responseDto?.message?.order?.items[0]?.id,
        domain: responseDto?.context?.domain,
        action: responseDto?.context?.action,
        quote: responseDto?.message?.order?.quote,
      },
    };
  }

  createInitPayload(responseDto: any) {
    const url = responseDto?.message?.order?.items[0]?.xinput?.form?.url;
    return {
      data: {
        transaction_id: responseDto?.context?.transaction_id,
        item_id: responseDto?.message?.order?.items[0]?.id,
        domain: responseDto?.context?.domain,
        action: responseDto?.context?.action,
        form_url: url ? url : initConstants.form_url,
      },
    };
  }

  createConfirmPayload(responseDto: any) {
    return {
      data: {
        // transaction_id: responseDto?.context?.transaction_id,
        // item_id: responseDto?.message?.order?.items[0]?.id,
        // domain: responseDto?.context?.domain,
        // action: responseDto?.context?.action,
        // order_id: responseDto?.message?.order?.id,
        // payments: responseDto?.message?.order?.payments,
        // stops: responseDto?.message?.order?.fulfillments[0]?.stops,

        transaction_id: responseDto?.context?.transaction_id,
        item_id: responseDto?.message?.items[0]?.id,
        domain: responseDto?.context?.domain,
        action: responseDto?.context?.action,
        order_id: responseDto?.message?.orderId,
        payments: responseDto?.message?.payments,
        stops: responseDto?.message?.fulfillments[0]?.stops,
      },
    };
  }

  statusPayload(responseDto: any) {
    this.logger.log('responseDto', JSON.stringify(responseDto.message));
    let certificate_url: string = '';
    responseDto?.message?.order?.fulfillments?.map((fulfillment) => {
      return fulfillment?.tags?.map((tag) => {
        if (tag?.descriptor?.code === 'course-completion-details') {
          return tag?.list?.map((list) => {
            if (list?.descriptor?.code === 'course-certificate') {
              certificate_url = list?.value;
              return list?.value;
            }
          });
        }
      });
    });
    return {
      data: {
        transaction_id: responseDto?.context?.transaction_id,
        domain: responseDto?.context?.domain,
        action: responseDto?.context?.action,
        order_id: responseDto?.message?.order?.id,
        status: responseDto?.message?.order?.fulfillments[0]?.state?.descriptor?.code,
        stops: responseDto?.message?.order?.fulfillments[0]?.stops
          ? responseDto?.message?.order?.fulfillments[0]?.stops
          : [],
        certificate_url: certificate_url,
      },
    };
  }

  ratePayload(responseDto: any) {
    return {
      data: {
        transaction_id: responseDto?.context?.transaction_id,
        domain: responseDto?.context?.domain,
        action: responseDto?.context?.action,
        feedback_form: responseDto?.message?.feedback_form,
      },
    };
  }

  cancelPayload(responseDto: any) {
    return {
      data: {
        transaction_id: responseDto?.context?.transaction_id,
        domain: responseDto?.context?.domain,
        action: responseDto?.context?.action,
        order_status: responseDto?.message?.order?.fulfillments[0]?.state?.descriptor?.name,
      },
    };
  }

  updatePayload(responseDto: any) {
    return {
      data: {
        transaction_id: responseDto?.context?.transaction_id,
        domain: responseDto?.context?.domain,
        action: responseDto?.context?.action,
        updated_catalogue_item_details: responseDto?.message,
      },
    };
  }

  trackPayload(responseDto: any) {
    return {
      data: {
        transaction_id: responseDto?.context?.transaction_id,
        domain: responseDto?.context?.domain,
        action: responseDto?.context?.action,
        track: responseDto?.message?.tracking,
      },
    };
  }

  supportPayload(responseDto: any) {
    return {
      data: {
        transaction_id: responseDto?.context?.transaction_id,
        domain: responseDto?.context?.domain,
        action: responseDto?.context?.action,
        support_message: responseDto?.message,
      },
    };
  }

  getXplorDomain(domain: string) {
    switch (domain) {
      case DomainsEnum.COURSE_DOMAIN:
        return xplorDomain.COURSE;
      case DomainsEnum.JOB_DOMAIN:
        return xplorDomain.JOB;
      default:
        return xplorDomain.SCHOLARSHIP;
    }
  }

  createInitOrderPayload(responseDto: any) {
    this.logger.log('responseDto', JSON.stringify(responseDto.message));
    return {
      transaction_id: responseDto?.context?.transaction_id,
      item_id: responseDto?.message?.order?.items[0]?.id,
      domain: responseDto?.context?.domain,
      order_id: responseDto?.message?.orderId,
      payments: responseDto?.message?.order?.payments,
      fulfillment: responseDto?.message?.order?.fulfillments,
      billing: responseDto?.message?.order?.billing,
      provider: responseDto?.message?.order?.provider,
      quote: responseDto?.message?.order?.quote,
    };
  }

  createConfirmOrderPayload(responseDto: any) {
    return {
      transaction_id: responseDto?.context?.transaction_id,
      item_id: responseDto?.message?.items[0]?.id,
      domain: responseDto?.context?.domain,
      order_id: responseDto?.message?.orderId,
      payments: responseDto?.message?.payments,
      fulfillment: responseDto?.message?.fulfillments,
      billing: responseDto?.message?.billing,
      provider: responseDto?.message?.provider,
      quote: responseDto?.message?.quote,
    };
  }
}

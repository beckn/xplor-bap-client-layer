import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';
import { Certificate } from 'crypto';

import { DomainsEnum, xplorDomain } from '../constants/enums';
import { initConstants } from '../constants/stg-constants';
@Injectable()
export class ResponsePayloadUtilsService {
  private readonly logger = new Logger(ResponsePayloadUtilsService.name);
  scholarshipPayload(responseDto) {
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

  coursePayload(responseDto) {
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

  createInitPayload(responseDto) {
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

  createConfirmPayload(responseDto) {
    return {
      data: {
        transaction_id: responseDto?.context?.transaction_id,
        item_id: responseDto?.message?.order?.items[0]?.id,
        domain: responseDto?.context?.domain,
        action: responseDto?.context?.action,
        order_id: responseDto?.message?.order?.id,
        payments: responseDto?.message?.order?.payments,
        stops: responseDto?.message?.order?.fulfillments[0]?.stops,
      },
    };
  }

  statusPayload(responseDto) {
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
        status: responseDto?.message?.order?.status,
        stops: responseDto?.message?.order?.fulfillments[0]?.stops
          ? responseDto?.message?.order?.fulfillments[0]?.stops
          : [],
        certificate_url: certificate_url,
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

  createOrderPayload(responseDto) {
    return {
      transaction_id: responseDto?.context?.transaction_id,
      item_id: responseDto?.message?.order?.items[0]?.id,
      domain: responseDto?.context?.domain,
      order_id: responseDto?.message?.order?.id,
      payments: responseDto?.message?.order?.payments,
      fulfillment: responseDto?.message?.order?.fulfillments,
      billing: responseDto?.message?.order?.billing,
      provider: responseDto?.message?.order?.provider,
      quote: responseDto?.message?.order?.quote,
    };
  }
}

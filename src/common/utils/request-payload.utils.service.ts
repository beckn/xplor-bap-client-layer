/* eslint-disable no-console */

import { Injectable } from '@nestjs/common';
import { SearchRequestDto } from 'src/modules/stg/dto/search-request.dto';
import { v4 as uuidv4 } from 'uuid';
import { searchConstants, stgAction } from '../constants/stg-constants';
import { SelectRequestDto } from 'src/modules/stg/dto/select-request-dto';
import { InitRequestDto } from 'src/modules/stg/dto/init-request.dto';
import { ConfirmRequestDto } from 'src/modules/stg/dto/confirm-request.dto';
import { StatusRequestDto } from 'src/modules/stg/dto/status-request.dto';
@Injectable()
export class RequestPayloadUtilsService {
  createSearchPayload(searchRequestDto: SearchRequestDto) {
    return {
      domain: searchRequestDto.domain,
      context: {
        action: stgAction.search,
        transaction_id: searchRequestDto.context.transaction_id,
        message_id: uuidv4(),
        ttl: searchConstants.ttl,
      },
      message: {
        intent: {
          item: {
            descriptor: {
              name: searchRequestDto?.message?.searchQuery,
            },
          },
        },
      },
    };
  }
  catch(error) {
    console.log(error);
    return error?.message;
  }

  createSelectPayload(selectRequestDto: SelectRequestDto) {
    return {
      context: {
        transaction_id: selectRequestDto.context.transaction_id,
        domain: selectRequestDto.context.domain,
        message_id: uuidv4(),
      },
      message: {
        order: {
          items_id: selectRequestDto.message.order.items_id,
          provider_id: selectRequestDto.message.order.provider_id,
          fulfillment_id: selectRequestDto?.message.order.fulfillment_id,
        },
      },
    };
  }

  createInitPayload(initRequestDto: InitRequestDto) {
    return {
      context: {
        transaction_id: initRequestDto.transaction_id,
        domain: initRequestDto.domain,
            message_id: uuidv4(),
        ttl:"PT10M"
      },
      message: {
        order: {
          items_id: initRequestDto.items_id,
          provider_id: initRequestDto.provider_id,
          billing: { ...initRequestDto.billing, id: uuidv4() },
        },
        fulfillment: { ...initRequestDto.fulfillments, id: uuidv4() },
      },
    };
  }

  createConfirmPayload(confirmRequestDto: ConfirmRequestDto) {
    return {
      context: {
        transaction_id: confirmRequestDto.transaction_id,
        domain: confirmRequestDto.domain ? confirmRequestDto.domain : 'scholarship',
        message_id: uuidv4(),
      },
      message: {
        order: {
          items_id: confirmRequestDto.items_id,
          provider_id: confirmRequestDto.provider_id,
          billing: { ...confirmRequestDto.billing, id: uuidv4() },
          fulfillments: { ...confirmRequestDto.fulfillments, id: uuidv4() },
          payments:
            confirmRequestDto.domain === 'scholarship'
              ? [
                  {
                    params: {
                      bank_code: 'IFSC_Code_Of_the_bank',
                      bank_account_number: '121212121212',
                      bank_account_name: 'Account Holder Name',
                    },
                  },
                ]
              : [
                  {
                    params: {
                      amount: '150',
                      currency: 'INR',
                    },
                  },
                ],
        },
      },
    };
  }

  createStatusPayload(confirmRequestDto: StatusRequestDto) {
    return {
      context: {
        transaction_id: confirmRequestDto.transaction_id,
        domain: confirmRequestDto.domain ? confirmRequestDto.domain : 'scholarship',
        message_id: uuidv4(),
      },
      message: {
        order: {
          id: confirmRequestDto.order_id,
        },
      },
    };
  }
}

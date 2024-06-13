import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { DomainsEnum, xplorDomain } from '../constants/enums';
import { billing, confirmBilling, confirmFulfillments, fulfillments } from '../constants/stg-constants';
import { IUserInfo } from '../interfaces/user-info';
import { SelectRequestDto } from '../../modules/stg/dto/select-request-dto';
import { ConfirmRequestDto } from '../../modules/stg/dto/confirm-request.dto';
import { InitRequestDto } from '../../modules/stg/dto/init-request.dto';
import { StatusRequestDto } from '../../modules/stg/dto/status-request.dto';
@Injectable()
export class RequestPayloadUtilsService {
  createSearchPayload() {
    return {};
  }
  catch(error) {
    return error?.message;
  }

  createSelectPayload(selectRequestDto: SelectRequestDto) {
    return {
      context: {
        transaction_id: selectRequestDto.transaction_id,
        domain: this.getXplorDomain(selectRequestDto.domain),
        message_id: uuidv4(),
      },
      message: {
        order: {
          items_id: [selectRequestDto.item_id],
          provider_id: selectRequestDto.provider_id,
        },
      },
    };
  }

  createInitPayload(initRequestDto: InitRequestDto, userInfo: IUserInfo) {
    return {
      context: {
        transaction_id: initRequestDto.transaction_id,
        domain: this.getXplorDomain(initRequestDto.domain),
        message_id: uuidv4(),
        ttl: 'PT10M',
      },
      message: {
        order: {
          items_id: [initRequestDto.item_id],
          provider_id: initRequestDto.provider_id,
          billing: userInfo
            ? {
                id: uuidv4(),
                name: userInfo?.kyc?.firstName + ' ' + userInfo?.kyc?.lastName || 'Doe',
                phone: userInfo?.phoneNumber || '+91-9663088848',
                email: userInfo?.kyc?.email || 'jane.doe@example.com',
                address: userInfo?.kyc?.address || 'No 27, XYZ Lane, etc',
              }
            : { ...billing, id: uuidv4() },
          fulfillment: userInfo
            ? [
                {
                  id: uuidv4(),
                  customer: {
                    person: {
                      name: userInfo?.kyc?.firstName + ' ' + userInfo?.kyc?.lastName || 'Jane Doe',
                      age: '13',
                      gender: userInfo?.kyc?.gender || 'M',
                      tags: [
                        {
                          descriptor: {
                            code: 'professional-details',
                            name: 'Professional Details',
                          },
                          list: [
                            {
                              descriptor: {
                                code: 'profession',
                                name: 'profession',
                              },
                              value: 'student',
                            },
                          ],
                          display: true,
                        },
                      ],
                    },
                    contact: {
                      phone: userInfo?.phoneNumber || '+91-9663088848',
                      email: userInfo?.kyc?.email || 'jane.doe@example.com',
                    },
                  },
                },
              ]
            : fulfillments,
        },
      },
    };
  }

  createConfirmPayload(confirmRequestDto: ConfirmRequestDto, user: IUserInfo) {
    return {
      context: {
        transaction_id: confirmRequestDto.transaction_id,
        domain: this.getXplorDomain(confirmRequestDto.domain),
        message_id: uuidv4(),
      },
      message: {
        order: {
          items_id: [confirmRequestDto.item_id],
          provider_id: confirmRequestDto.provider_id,
          billing: { ...confirmBilling(user), id: uuidv4() },
          fulfillments: confirmFulfillments(user),
          payments:
            confirmRequestDto.domain === DomainsEnum.SCHOLARSHIP_DOMAIN
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
                    status: 'PAID',
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
        domain: this.getXplorDomain(confirmRequestDto.domain),
        message_id: uuidv4(),
        ttl: 'PT10M',
      },
      message: {
        order: {
          id: confirmRequestDto.order_id,
        },
      },
    };
  }

  createRatingPayload(
    rating: string,
    items_id: string[],
    provider_id: string,
    rating_category: string,
    order_id: string,
    transaction_id: string,
    domain: string,
  ) {
    return {
      context: {
        transaction_id: transaction_id,
        domain: domain,
        message_id: uuidv4(),
        ttl: 'PT10M',
      },
      message: {
        order: {
          id: order_id,
          items_id: items_id,
          provider_id: provider_id,
          rating_category: rating_category,
          value: rating,
        },
      },
    };
  }
  getXplorDomain(domain: string) {
    switch (domain) {
      case DomainsEnum.COURSE_DOMAIN:
        return xplorDomain.COURSE;
      case DomainsEnum.JOB_DOMAIN:
        return xplorDomain.JOB;
      case DomainsEnum.SCHOLARSHIP_DOMAIN:
        return xplorDomain.SCHOLARSHIP;
      case DomainsEnum.RETAIL_DOMAIN:
        return xplorDomain.RETAIL;
      case xplorDomain.COURSE:
        return xplorDomain.COURSE;
      case xplorDomain.SCHOLARSHIP:
        return xplorDomain.SCHOLARSHIP;

      default:
        return 'dsep-belem:courses';
    }
  }
}

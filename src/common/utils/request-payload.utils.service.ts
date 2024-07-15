import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { DomainsEnum, xplorDomain } from '../constants/enums';
import { IUserInfo } from '../interfaces/user-info';
import { SelectRequestDto } from '../../modules/stg/dto/select-request-dto';
import { ConfirmRequestDto } from '../../modules/stg/dto/confirm-request.dto';
import { InitRequestDto } from '../../modules/stg/dto/init-request.dto';
import { StatusRequestDto } from '../../modules/stg/dto/status-request.dto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class RequestPayloadUtilsService {
  constructor(private readonly configService: ConfigService) {}
  createSearchPayload() {
    return {};
  }
  catch(error) {
    return error?.message;
  }

  createGclSearchPayload(gclSearchRequestDto: any) {
    try {
      return {
        context: {
          domain: gclSearchRequestDto?.domain,
        },
        searchString: gclSearchRequestDto?.query,
      };
    } catch (error) {
      return error;
    }
  }
  createSelectPayload(selectRequestDto: SelectRequestDto, itemDetails: any) {
    const context = itemDetails?.context ? JSON.parse(itemDetails?.context) : null;

    return {
      data: [
        {
          context: {
            transaction_id: selectRequestDto.transaction_id,
            bpp_id: itemDetails?.bpp_id ? itemDetails?.bpp_id : this.configService.get('BELEM_BPP_ID'),
            bpp_uri: itemDetails?.bpp_uri ? itemDetails?.bpp_uri : this.configService.get('BELEM_BPP_URI'),
            domain: selectRequestDto.domain,
          },
          message: {
            orders: [
              {
                provider: {
                  id: selectRequestDto.provider_id,
                },
                items: [
                  {
                    id: selectRequestDto.item_id,
                  },
                ],
              },
            ],
          },
        },
      ],
    };
  }

  createInitPayload(initRequestDto: InitRequestDto, userInfo: IUserInfo, itemDetails: any) {
    try {
      return {
        data: [
          {
            context: {
              transaction_id: initRequestDto.transaction_id,
              bpp_id: itemDetails?.bpp_id ? itemDetails?.bpp_id : this.configService.get('BELEM_BPP_ID'),
              bpp_uri: itemDetails?.bpp_uri ? itemDetails?.bpp_uri : this.configService.get('BELEM_BPP_URI'),
              domain: initRequestDto.domain,
            },
            message: {
              orders: [
                {
                  provider: {
                    id: initRequestDto.provider_id,
                  },
                  items: [
                    {
                      id: initRequestDto.item_id,
                    },
                  ],
                  fulfillments: [
                    {
                      id: uuidv4(),
                      customer: {
                        person: {
                          name: userInfo?.kyc?.firstName + ' ' + userInfo?.kyc?.lastName || 'Jane Doe',
                          email: userInfo.kyc?.email ?? 'janedoe@gmail.com',
                        },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      };
    } catch (error) {
      return error;
    }
  }

  createConfirmPayload(confirmRequestDto: ConfirmRequestDto, userInfo: IUserInfo, itemDetails: any) {
    return {
      data: [
        {
          context: {
            transaction_id: confirmRequestDto.transaction_id,
            domain: confirmRequestDto.domain,
            bpp_id: itemDetails?.bpp_id ? itemDetails?.bpp_id : this.configService.get('BELEM_BPP_ID'),
            bpp_uri: itemDetails?.bpp_uri ? itemDetails?.bpp_uri : this.configService.get('BELEM_BPP_URI'),
          },
          message: {
            orders: [
              {
                provider: {
                  id: confirmRequestDto.provider_id,
                },
                items: [
                  {
                    id: confirmRequestDto.item_id,
                  },
                ],
                fulfillments: [
                  {
                    id: uuidv4(),
                    customer: {
                      person: {
                        name: userInfo?.kyc?.firstName + ' ' + userInfo?.kyc?.lastName || 'Jane Doe',
                        email: userInfo.kyc?.email ?? 'janedoe1@gmail.com',
                      },
                      contact: {
                        phone: userInfo?.phoneNumber,
                        email: userInfo.kyc?.email ?? 'janedoe2@gmail.com',
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    };
  }

  createStatusPayload(statusRequestDto: StatusRequestDto, itemDetails: any) {
    return {
      data: [
        {
          context: {
            transaction_id: statusRequestDto.transaction_id,
            domain: statusRequestDto.domain,
            bpp_id: itemDetails?.bpp_id ? itemDetails?.bpp_id : this.configService.get('BELEM_BPP_ID'),
            bpp_uri: itemDetails?.bpp_uri ? itemDetails?.bpp_uri : this.configService.get('BELEM_BPP_URI'),
          },
          message: {
            order_id: statusRequestDto.order_id,
          },
        },
      ],
    };
  }

  createRatingPayload(rating: string, rating_category: string, order_id: string, domain: string, itemDetails: any) {
    return {
      data: [
        {
          context: {
            domain: this.getXplorDomain(domain),
            bpp_id: itemDetails?.bpp_id ? itemDetails?.bpp_id : this.configService.get('BELEM_BPP_ID'),
            bpp_uri: itemDetails?.bpp_uri ? itemDetails?.bpp_uri : this.configService.get('BELEM_BPP_URI'),
          },
          message: {
            ratings: [
              {
                id: order_id,
                rating_category: rating_category,
                value: rating,
              },
            ],
          },
        },
      ],
    };
  }

  createCancelPayload(
    transactionId: string,
    cancellationReasonId: string,
    orderId: string,
    domain: string,
    itemDetails: any,
  ) {
    return {
      data: [
        {
          context: {
            domain: domain,
            transaction_id: transactionId,
          },
          message: {
            order_id: orderId,
            cancellation_reason_id: cancellationReasonId,
          },
        },
      ],
    };
  }

  createUpdatePayload(transactionId: string, name: string, orderId: string, domain: string, itemDetails: any) {
    return {
      data: [
        {
          context: {
            domain: this.getXplorDomain(domain),
            bpp_id: itemDetails?.bpp_id ? itemDetails?.bpp_id : this.configService.get('BELEM_BPP_ID'),
            bpp_uri: itemDetails?.bpp_uri ? itemDetails?.bpp_uri : this.configService.get('BELEM_BPP_URI'),
            transaction_id: transactionId,
          },
          order_id: orderId,
          updateDetails: {
            updateTarget: 'order.fulfillments[0].customer.person.name',
            fulfillments: [
              {
                customer: {
                  person: {
                    name: name,
                  },
                },
              },
            ],
          },
        },
      ],
    };
  }

  createSupportPayload(transactionId: string, ref_id: string, orderId: string, domain: string, itemDetails: any) {
    return {
      data: [
        {
          context: {
            domain: this.getXplorDomain(domain),
            bpp_id: itemDetails?.bpp_id ? itemDetails?.bpp_id : this.configService.get('BELEM_BPP_ID'),
            bpp_uri: itemDetails?.bpp_uri ? itemDetails?.bpp_uri : this.configService.get('BELEM_BPP_URI'),
            transaction_id: transactionId,
          },
          message: {
            support: {
              ref_id: ref_id,
            },
          },
        },
      ],
    };
  }

  createTrackPayload(transactionId: string, callbackUrl: string, orderId: string, domain: string, itemDetails: any) {
    return {
      data: [
        {
          context: {
            domain: this.getXplorDomain(domain),
            bpp_id: itemDetails?.bpp_id ? itemDetails?.bpp_id : this.configService.get('BELEM_BPP_ID'),
            bpp_uri: itemDetails?.bpp_uri ? itemDetails?.bpp_uri : this.configService.get('BELEM_BPP_URI'),
            transaction_id: transactionId,
          },
          orderId: orderId,
          callbackUrl: callbackUrl,
        },
      ],
    };
  }

  getXplorDomain(domain: string) {
    switch (domain) {
      case DomainsEnum.DSEP_COURSES:
        return xplorDomain.COURSE;
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
        return 'learning:dsep:belem';
    }
  }
}

// Import necessary decorators and components from NestJS
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PhoneNumberDto } from './dto/phone-number.dto';
import {
  AssignRoleDto,
  CreateDevicePreferenceDto,
  CreateLanguageDto,
  CreateMPinDto,
  CreateUserDto,
  QueryOtpTypeDto,
  QueryUserProfile,
  UpdateDevicePreferenceDto,
  VerifyOtpDto,
} from './dto';
import { HttpResponseMessage, USER_ERROR_MESSAGES } from '../../common/constants/error-message';
import { ResetMpinDto } from './dto/reset-mpin.dto';
import { ConfigService } from '@nestjs/config';
import { CreateWalletDto } from '../wallet/dto';
import { DeviceIdDto } from '../../common/utils/dto/device-dto';
import { OrderDumpService } from '../dump/service/order-dump.service';
import { UserProfile } from '../../common/constants/user/user-profile';
import { GetUrl } from '../../common/utils/get-urls-utils.service';
import { getSuccessResponse } from '../../utils/success-response.util';
import { ResponsePayloadUtilsService } from '../../common/utils/response-payload.utils.service';
import { Languages } from '../../common/constants/enums';
import { ItemDumpService } from '../dump/service/item-dump.service';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { RateOrderDto } from './dto/rate.order';
import { OrderStatus, fulfillments } from '../../common/constants/stg-constants';
import { AxiosService } from '../../common/axios/axios.service';
import { RequestPayloadUtilsService } from '../../common/utils/request-payload.utils.service';

// Define the UserService with necessary methods for user operations
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly serverDefaultLanguage: string;
  constructor(
    private readonly getUrl: GetUrl,
    private readonly httpService: HttpService,
    private readonly axiosHttp: AxiosService,
    private readonly configService: ConfigService,
    private readonly orderService: OrderDumpService,
    private readonly itemDumpService: ItemDumpService,
    private readonly responsePayloadUtilsService: ResponsePayloadUtilsService,
    private readonly requestPayloadUtilsService: RequestPayloadUtilsService,
  ) {
    this.serverDefaultLanguage = this.configService.get('serverDefaultLanguage');
  }

  // Method to find a user by token
  async findOne(token: string, query: QueryUserProfile) {
    try {
      const foundUser = (
        await this.httpService.axiosRef.get(this.getUrl.getUserProfileUrl, {
          headers: {
            Authorization: token,
          },
          params: query,
        })
      )?.data;
      const count: any = UserProfile.count;
      let totalCount = 0;
      const orders = (await this.getUserOrdersCountForDomain(token))?.data;
      orders.map((value: any) => {
        const domain = this.responsePayloadUtilsService.getXplorDomain(value._id);
        const domainCount = value?.count;
        totalCount = totalCount + domainCount;
        count[domain] = domainCount?.toString();
      });
      foundUser.data.count = { ...count, orders: totalCount.toString() || '0' };
      return foundUser;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.GET_USER_DETAILS, error);
      throw error?.response?.data;
    }
  }
  // Method to get user journey
  async getUserJourney(token: string) {
    try {
      return (
        await this.httpService.axiosRef.get(this.getUrl.getUserJourneyUrl, {
          headers: {
            Authorization: token,
          },
        })
      )?.data;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.GET_USER_JOURNEY, error);
      throw error?.response?.data;
    }
  }
  // Method to find roles
  async findRoles(deviceIdDto: DeviceIdDto) {
    try {
      const roles = (await this.httpService.axiosRef.get(this.getUrl.getRolesUrl, { params: deviceIdDto }))?.data;

      return roles;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.GET_USER_ROLES, error);
      throw error?.response?.data;
    }
  }
  // Method to assign role to a user
  async assignRole(assignRoleDto: AssignRoleDto, token: string) {
    try {
      return (
        await this.httpService.axiosRef.patch(this.getUrl.getAssignRoleUrl, assignRoleDto, {
          headers: {
            Authorization: token,
          },
        })
      )?.data;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.ASSIGN_USER_ROLE, error);
      throw error?.response?.data;
    }
  }

  // Method to send OTP
  async sendOtp(phoneNumberDto: PhoneNumberDto): Promise<string> {
    try {
      const otp = (await this.httpService.axiosRef.post(this.getUrl.getUserSendOtpUrl, phoneNumberDto))?.data;
      return otp;
    } catch (error: any) {
      this.logger.error(USER_ERROR_MESSAGES.SEND_OTP, error);
      throw error?.response?.data;
    }
  }

  async sendMpinOtp(token: string) {
    try {
      return (
        await this.httpService.axiosRef.put(
          this.getUrl.getUserSendMpinOtpUrl,
          {},
          { headers: { Authorization: token } },
        )
      )?.data;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.SEND_OTP, error);
      throw error?.response?.data;
    }
  }
  // Method to verify OTP
  async verifyOtp(token: string, queryOtpTypeDto: QueryOtpTypeDto, verifyOtpDto: VerifyOtpDto): Promise<any> {
    try {
      return (
        await this.httpService.axiosRef.post(this.getUrl.getUserVerifyOtpUrl, verifyOtpDto, {
          params: queryOtpTypeDto,
          headers: { Authorization: token },
        })
      )?.data;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.VERIFY_OTP, error);
      error.response.data.targetLanguageCode = verifyOtpDto.targetLanguageCode;
      throw error.response.data;
    }
  }

  async resetMpin(token: string, resetMpinDto: ResetMpinDto) {
    try {
      return (
        await this.httpService.axiosRef.put(this.getUrl.getUserResetMpinUrl, resetMpinDto, {
          headers: { Authorization: token },
        })
      )?.data;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.UPDATER_USER_MPIN, error);
      throw error?.response?.data;
    }
  }

  // Method to create MPIN
  async createMPin(token: string, mPin: CreateMPinDto) {
    try {
      return (
        await this.httpService.axiosRef.post(this.getUrl.createUserMPinUrl, mPin, {
          headers: { Authorization: token },
        })
      )?.data;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.CREATE_USER_MPIN, error);
      throw error?.response?.data;
    }
  }

  // Method to verify MPIN
  async verifyMPin(token: string, mPin: CreateMPinDto) {
    try {
      return (
        await this.httpService.axiosRef.put(this.getUrl.verifyUserMPinUrl, mPin, { headers: { Authorization: token } })
      )?.data;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.VERIFY_USER_MPIN, error);
      throw error?.response?.data;
    }
  }

  async getAccessToken(token: string) {
    try {
      return (
        await this.httpService.axiosRef.get(this.getUrl.refreshUserTokenUrl, {
          headers: { Authorization: token },
        })
      )?.data;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.VERIFY_TOKEN, error);
      throw error?.response?.data;
    }
  }

  async logoutUser(token: string) {
    try {
      return (
        await this.httpService.axiosRef.put(
          this.getUrl.logOutUserUrl,
          {},
          {
            headers: { Authorization: token },
          },
        )
      )?.data;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  // Method to create user profile for the implementer
  async createUser(token: string, user: CreateUserDto) {
    try {
      const roles = (
        await this.httpService.axiosRef.get(this.getUrl.getRolesUrl, { headers: { Authorization: token } })
      )?.data?.data;
      const role = roles.map((element: any) => {
        if (element.type === user.role) return element;
      });
      const roleId = role[0]?._id;
      const userDataForWallet = new CreateWalletDto(user.kyc.firstName + ' ' + user.kyc.lastName, user.kyc.email, '');
      const newWallet = (
        await this.httpService.axiosRef.post(this.getUrl.getWalletUrl, userDataForWallet, {
          headers: { Authorization: token },
        })
      )?.data?.data;
      const walletId = newWallet?._id;

      const updatedUser = (
        await this.httpService.axiosRef.patch(
          this.getUrl.getUserProfileUrl,
          { wallet: walletId, role: roleId, kyc: user.kyc }, //need to create the inerface
          {
            headers: { Authorization: token },
          },
        )
      )?.data;
      return updatedUser;
      // return (await this.httpService.axiosRef.post(this.getUrl.createUserUrl, user))?.data;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.CREATE_USER, error);
      throw error?.response?.data;
    }
  }

  async updateUserLanguagePreference(token: string, createLanguageDto: CreateLanguageDto) {
    try {
      return (
        await this.httpService.axiosRef.patch(this.getUrl.updateUserLanguagePreferenceUrl, createLanguageDto, {
          headers: { Authorization: token },
        })
      )?.data;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.UPDATE_USER_LANGUAGE_PREFERENCE, error);
      throw error?.response?.data;
    }
  }

  async createDevicePreference(createDevicePreference: CreateDevicePreferenceDto) {
    try {
      return (await this.httpService.axiosRef.post(this.getUrl.getDevicePreferenceUrl, createDevicePreference))?.data;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.CREATE_DEVICE_PREFERENCE, error);
      error.response.data.targetLanguageCode = createDevicePreference.languageCode;
      throw error?.response?.data;
    }
  }
  async updateDevicePreference(updateDevicePreferenceDto: UpdateDevicePreferenceDto) {
    try {
      return (await this.httpService.axiosRef.patch(this.getUrl.getDevicePreferenceUrl, updateDevicePreferenceDto))
        ?.data;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.UPDATE_DEVICE_PREFERENCE, error);
      throw error?.response?.data;
    }
  }

  async getDevicePreferenceById(deviceId: string) {
    try {
      const response = (await this.httpService.axiosRef.get(this.getUrl.getDevicePreferenceUrl + `/${deviceId}`))?.data;
      return response;
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.GET_DEVICE_PREFERENCE, error);
      throw error?.response?.data;
    }
  }

  async getUserOrders(token: string, paginationRequest: GetOrdersQueryDto) {
    try {
      const user: any = (
        await this.httpService.axiosRef.get(this.getUrl.getUserProfileUrl, {
          headers: { Authorization: token },
          params: { translate: false },
        })
      )?.data?.data;
      const languageCode = user?.languagePreference ?? Languages.ENGLISH;
      const userId = user._id;
      this.logger.log('userId', userId);
      this.logger.log('languageCode', languageCode);
      const orders = await this.orderService.findOrders(userId, paginationRequest);
      const itemIds = (orders?.orders as []).map((item) => item['item_id']);
      const providerIds = (orders?.orders as []).map((item) => item['provider_id']);

      const responseData: any = await this.itemDumpService.findPaginatedItemsForOrders(
        itemIds,
        languageCode,
        1,
        itemIds.length,
        '',
        [],
      );
      const translatedItems = responseData.items;
      // this.logger.log('translatedItems', translatedItems);
      const translatedOrders = await Promise.all(
        orders?.orders.map((order) => {
          const translatedData = translatedItems.find((item) => item['item_id'] === order['item_id']);
          const mappedOrder = {
            _id: order._id,
            order_id: order.order_id,
            transaction_id: order.transaction_id,
            domain: order.domain,
            rating: order.rating,
            is_added_to_wallet: order.is_added_to_wallet,
            certificate_url: order?.status == OrderStatus.COMPLETED ? order?.certificate_url : '',
            status: order.status,
            item_details: {
              item_id: order.item_id,
              provider_name: translatedData?.provider?.name,
              provider_images: translatedData?.provider?.images,
              descriptor: {
                name: translatedData?.descriptor?.name,
                long_desc: translatedData?.descriptor?.long_desc,
                short_desc: translatedData?.descriptor?.short_desc,
                images: translatedData?.descriptor?.images,
              },
            },
            fulfillment: {
              media: order?.fulfillment?.[0]?.stops?.[0]?.instructions?.media ?? [],
            },
          };
          // this.logger.log('mappedOrder', mappedOrder);
          return mappedOrder;
        }),
      );
      return getSuccessResponse(
        {
          orders: translatedOrders,
          totalCount: orders?.totalCount,
          currentSize: paginationRequest.page * paginationRequest.pageSize,
        },
        HttpResponseMessage.OK,
      );
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.UPDATE_USER_LANGUAGE_PREFERENCE, error);
      throw error?.response?.data;
    }
  }

  async getOrderById(token: string, orderId: string) {
    try {
      const user: any = (
        await this.httpService.axiosRef.get(this.getUrl.getUserProfileUrl, {
          headers: { Authorization: token },
          params: { translate: false },
        })
      )?.data?.data;
      const languageCode = user?.languagePreference ?? Languages.ENGLISH;
      const userId = user._id;
      this.logger.log('userId', userId);
      this.logger.log('languageCode', languageCode);
      const order = await this.orderService.findOrderById(userId, orderId);
      const translatedItem = await this.itemDumpService.findByItemId({ item_id: order?.item_id }, languageCode);
      const mappedOrder = {
        ...order._doc,
        item_details: {
          ...order?.item_details?._doc,
          item_id: order.item_id,
          provider_name: translatedItem?.provider?.name,
          provider_images: translatedItem?.provider?.images,
          descriptor: {
            name: translatedItem?.descriptor?.name,
            long_desc: translatedItem?.descriptor?.long_desc,
            short_desc: translatedItem?.descriptor?.short_desc,
            images: translatedItem?.descriptor?.images,
          },
        },
        certificate_url: order?.status == OrderStatus.COMPLETED ? order?.certificate_url : '',
      };

      return getSuccessResponse(mappedOrder, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.UPDATE_USER_LANGUAGE_PREFERENCE, error);
      throw error?.response?.data;
    }
  }

  async rateOrder(token: string, orderId: string, rateOrderRequest: RateOrderDto) {
    try {
      const rateOrder = await this.orderService.rateOrder(orderId, rateOrderRequest);
      const requestPayload = await this.requestPayloadUtilsService.createRatingPayload(
        rateOrderRequest.rating,
        [rateOrder?.item_id],
        rateOrder?.provider?.id,
        'items',
        rateOrder?.order_id,
        rateOrder?.transaction_id,
        rateOrder?.domain,
      );
      return getSuccessResponse(rateOrder, HttpResponseMessage.OK);
      this.logger.log('requestPayload', requestPayload);
      const networkRequest = await this.axiosHttp.post(this.getUrl.rateOrderNetwork, requestPayload, {
        Authorization: token,
      });
      this.logger.log(networkRequest, 'networkRequest');
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.UPDATE_USER_LANGUAGE_PREFERENCE, error);
      throw error;
    }
  }

  async updateIsAddedToWallet(orderId: string) {
    try {
      const rateOrder = await this.orderService.updateIsAddedToWallet(orderId, true);
      return getSuccessResponse(rateOrder, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.UPDATE_USER_LANGUAGE_PREFERENCE, error);
      throw error?.response?.data;
    }
  }

  async getUserOrdersCountForDomain(token: string) {
    try {
      const user: any = (
        await this.httpService.axiosRef.get(this.getUrl.getUserProfileUrl, {
          headers: { Authorization: token },
          params: { translate: false },
        })
      )?.data?.data;
      this.logger.log('user', user);
      const userId = user._id;
      this.logger.log('userId', userId);
      return getSuccessResponse(await this.orderService.findOrdersCountForDomain(userId), HttpResponseMessage.OK);
    } catch (error) {
      this.logger.error(USER_ERROR_MESSAGES.UPDATE_USER_LANGUAGE_PREFERENCE, error);
      throw error?.response?.data;
    }
  }
}

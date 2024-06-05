import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as jwt from 'jsonwebtoken';

import { GetUrl } from '../../common/utils/get-urls-utils.service';
import { IProvider } from './interfaces/provider.interface';
import { EAUTH_ERROR_MESSAGES } from '../../common/constants/error-message';
import { CallBackQueryDto } from './dto/callback-query.dto';
import { KycSuccessResponse, KycUnSuccessResponse } from '../../common/constants/response-message';

// Define the EAuthService with necessary methods
@Injectable()
export class EAuthService {
  private readonly logger: Logger;
  constructor(private readonly httpService: HttpService, private readonly getUrl: GetUrl) {
    this.logger = new Logger(EAuthService.name);
  }

  // Method to get list of providers
  async getProviders(token: string) {
    try {
      const responseData: IProvider[] = (
        await this.httpService.axiosRef.get(this.getUrl.getProvidersUrl, {
          headers: {
            Authorization: token,
          },
        })
      )?.data;
      return responseData;
    } catch (error) {
      this.logger.error(EAUTH_ERROR_MESSAGES.GET_PROVIDERS, error);
      throw error?.response?.data;
    }
  }

  async updateUserOnCallBack(
    callBackQueryDto: CallBackQueryDto,
    connectedClients: Map<string, any>,
    sendDataToClients: (userId: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    const userId = (jwt.decode(callBackQueryDto.state.split(' ')[1]) as any)?.sub || '';
    try {
      const user = (
        await this.httpService.axiosRef.get(this.getUrl.updateUserOnCallBackUrl, { params: callBackQueryDto })
      )?.data;
      if (user) {
        sendDataToClients(userId, KycSuccessResponse, connectedClients);
      }
    } catch (error) {
      sendDataToClients(userId, KycUnSuccessResponse, connectedClients);
      this.logger.error(EAUTH_ERROR_MESSAGES.GET_USER_DETAILS, error);
      throw error?.response?.data;
    }
  }
}

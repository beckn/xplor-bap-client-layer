/* eslint-disable no-console */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { GetUrl } from '../../common/utils/get-urls-utils.service';
import { IProvider } from './interfaces/provider.interface';
import { EAUTH_ERROR_MESSAGES } from '../../common/constants/error-message';

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
      throw error;
    }
  }
}

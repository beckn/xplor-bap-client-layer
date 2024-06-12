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

  async submitKycForm(
    kycData: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (userId: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    const address = {
      careOf: kycData.lastName,
      district: kycData.district,
      houseNumber: kycData.houseNumber,
      landmark: kycData.landmark,
      locality: kycData.locality,
      phone: kycData.phone,
      pincode: kycData.pincode,
      postOffice: kycData.pincode,
      state: kycData.state,
      street: kycData.street,
      subDistrict: kycData.district,
    };
    const data = {
      firstName: kycData.firstName,
      lastName: kycData.lastName,
      email: kycData.email,
      address: JSON.stringify(address),
      phone: kycData.phone,
      gender: kycData.gender.charAt(0).toUpperCase(),
      dob: this.formatDob(kycData.dob),
    };
    const token = kycData.authToken;
    // console.log('urlParams', kycData.urlParams);
    const userId = (jwt.decode(token.split(' ')[1]) as any)?.sub || '';
    try {
      const user = (
        await this.httpService.axiosRef.patch(this.getUrl.updateUserKyc, data, {
          headers: { Authorization: token },
        })
      )?.data;
      if (user) {
        setTimeout(() => {
          sendDataToClients(userId, KycSuccessResponse, connectedClients);
        }, 3000);
      }
    } catch (error) {
      setTimeout(() => {
        sendDataToClients(userId, KycUnSuccessResponse, connectedClients);
      }, 3000);

      this.logger.error(EAUTH_ERROR_MESSAGES.GET_USER_DETAILS, error);
      throw error?.response?.data;
    }
  }

  formatDob(inputDate) {
    const parts = inputDate.split('-'); // Split the input date string by '-'
    const formattedDate = new Date(parts[0], parts[1] - 1, parts[2]); // Create a Date object with the parts
    const month = formattedDate.getMonth() + 1; // Get the month (zero-based index, so add 1)
    const day = formattedDate.getDate(); // Get the day
    const year = formattedDate.getFullYear(); // Get the year

    // Format the date as 'mm/dd/yyyy'
    const formattedDateString = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;

    return formattedDateString;
  }
}

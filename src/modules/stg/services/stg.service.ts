import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { SearchRequestDto } from '../dto/search-request.dto';
import { GetUrl } from 'src/common/utils/get-urls-utils.service';
import { SelectRequestDto } from '../dto/select-request-dto';
import { InitRequestDto } from '../dto/init-request.dto';
import { ConfirmRequestDto } from '../dto/confirm-request.dto';

@Injectable()
export class StgService {
  private deviceIdMapper: Map<string, any> = new Map();
  private serverDefaultLanguage: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly getUrl: GetUrl,
    private readonly configService: ConfigService,
  ) {
    this.deviceIdMapper = new Map();
    this.serverDefaultLanguage = this.configService.get('serverDefaultLanguage');
  }

  async search(searchRequestDto: SearchRequestDto) {
    try {
      const searchResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgSearchUrl, searchRequestDto))
        ?.data;
      return searchResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async select(selectRequestDto: SelectRequestDto) {
    try {
      const searchResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgSelectUrl, selectRequestDto))
        ?.data;
      return searchResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async init(initRequestDto: InitRequestDto) {
    try {
      const searchResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgInitUrl, initRequestDto))?.data;
      return searchResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async confirm(confirmRequestDto: ConfirmRequestDto) {
    try {
      const searchResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgConfirmUrl, confirmRequestDto))
        ?.data;
      return searchResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  // async status(statusRequestDto: StatusRequestDto) {
  //   try {
  //     const searchResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgStatusUrl, statusRequestDto))
  //       ?.data;
  //     return searchResponse;
  //   } catch (error) {
  //     throw error?.response?.data;
  //   }
  // }

  async onSearch(
    searchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transactionId: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      sendDataToClients(searchRequestDto?.context?.transaction_id, searchRequestDto?.data, connectedClients);
      return searchRequestDto;
    } catch (error) {
      throw error?.response?.data;
    }
  }
}

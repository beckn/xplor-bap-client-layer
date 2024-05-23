import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { SearchRequestDto } from '../dto/search-request.dto';
import { GetUrl } from 'src/common/utils/get-urls-utils.service';
import { SelectRequestDto } from '../dto/select-request-dto';
import { InitRequestDto } from '../dto/init-request.dto';
import { ConfirmRequestDto } from '../dto/confirm-request.dto';
import { StatusRequestDto } from '../dto/status-request.dto';
import { RequestPayloadUtilsService } from 'src/common/utils/request-payload.utils.service';

@Injectable()
export class StgService {
  private deviceIdMapper: Map<string, any> = new Map();
  private serverDefaultLanguage: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly getUrl: GetUrl,
    private readonly configService: ConfigService,
    private readonly payloadService: RequestPayloadUtilsService,
  ) {
    this.deviceIdMapper = new Map();
    this.serverDefaultLanguage = this.configService.get('serverDefaultLanguage');
  }

  async search(searchRequestDto: SearchRequestDto) {
    try {
      const searchPayload = this.payloadService.createSearchPayload(searchRequestDto);

      const searchResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgSearchUrl, searchPayload))?.data;
      return searchResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async select(selectRequestDto: SelectRequestDto) {
    try {
      const selectPayload = this.payloadService.createSelectPayload(selectRequestDto);
      const searchResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgSelectUrl, selectPayload))?.data;
      return searchResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async init(initRequestDto: InitRequestDto) {
    try {
      const initPayload = this.payloadService.createInitPayload(initRequestDto);
      const searchResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgInitUrl, initPayload))?.data;
      return searchResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async confirm(confirmRequestDto: ConfirmRequestDto) {
    try {
      const confirmPayload = this.payloadService.createConfirmPayload(confirmRequestDto);
      const searchResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgConfirmUrl, confirmPayload))?.data;
      return searchResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async status(statusRequestDto: StatusRequestDto) {
    try {
      const statusPayload = this.payloadService.createStatusPayload(statusRequestDto);

      const searchResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgStatusUrl, statusPayload))?.data;
      return searchResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

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

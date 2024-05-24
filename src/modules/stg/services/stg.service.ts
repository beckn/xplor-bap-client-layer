/* eslint-disable no-console  */
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
import { CourseDumpService } from 'src/modules/dump/service/course-dump.service';
import { ScholarshipDumpService } from 'src/modules/dump/service/scholarship-dump.service';
import { JobDumpService } from 'src/modules/dump/service/job-dump.service';
import { RetailDumpService } from 'src/modules/dump/service/retail-dump.service';
import { DomainsEnum } from 'src/common/constants/enums';
import { CreateDumpDto } from 'src/modules/dump/dto/create-dump.dto';

@Injectable()
export class StgService {
  private deviceIdMapper: Map<string, any> = new Map();
  private serverDefaultLanguage: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly getUrl: GetUrl,
    private readonly configService: ConfigService,
    private readonly payloadService: RequestPayloadUtilsService,
    private readonly courseDumpService: CourseDumpService,
    private readonly scholarshipDumpService: ScholarshipDumpService,
    private readonly jobDumpService: JobDumpService,
    private readonly retailDumpService: RetailDumpService,
  ) {
    this.deviceIdMapper = new Map();
    this.serverDefaultLanguage = this.configService.get('serverDefaultLanguage');
  }

  async search(searchRequestDto: SearchRequestDto) {
    try {
      const searchPayload = this.payloadService.createSearchPayload(searchRequestDto);
      searchPayload?.domain.forEach(async (domain) => {
        const createDumpDto: CreateDumpDto = {
          context: searchPayload?.context,
          transaction_id: searchPayload?.context?.transaction_id,
          domain: domain,
          message_id: searchPayload?.context?.message_id,
          device_id: searchRequestDto?.deviceId,
          request_type: 'search',
          message: searchRequestDto?.message,
        };

        // const dump =
        domain == 'course'
          ? await this.courseDumpService.create(createDumpDto)
          : domain == 'job'
          ? await this.jobDumpService.create(createDumpDto)
          : domain == 'scholarship'
          ? await this.scholarshipDumpService.create(createDumpDto)
          : await this.retailDumpService.create(createDumpDto);
      });

      const searchResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgSearchUrl, searchPayload))?.data;
      return searchResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async select(selectRequestDto: SelectRequestDto) {
    try {
      const selectPayload = this.payloadService.createSelectPayload(selectRequestDto);
      const selectResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgSelectUrl, selectPayload))?.data;
      console.log(selectResponse, 'selectResponse');
      return selectResponse;
    } catch (error) {
      console.log(error?.message);
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
      console.log('error', JSON.stringify(error));
      throw error?.response?.data;
    }
  }

  async onSearch(
    searchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transactionId: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      // Dump data to database
      console.log('searchRequestDto', JSON.stringify(searchRequestDto.data));
      const domain =
        searchRequestDto?.context?.domain === DomainsEnum.COURSE_DOMAIN
          ? 'course'
          : searchRequestDto?.context?.domain === DomainsEnum.JOB_DOMAIN
          ? 'job'
          : searchRequestDto?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN
          ? 'scholarship'
          : 'retail';
      const message = searchRequestDto?.data[domain];

      const selectRequestDetails =
        domain == 'course'
          ? await this.courseDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'search')
          : domain == 'job'
          ? await this.jobDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'search')
          : domain == 'scholarship'
          ? await this.scholarshipDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'search')
          : await this.retailDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'search');
      // Dump the response into database
      const createDumpDto: CreateDumpDto = {
        context: searchRequestDto?.context,
        transaction_id: searchRequestDto?.context?.transaction_id,
        domain: domain,
        message_id: searchRequestDto?.context?.message_id,
        device_id: selectRequestDetails?.device_id,
        request_type: searchRequestDto?.context?.action,
        message: message,
      };

      domain == 'course'
        ? await this.courseDumpService.create(createDumpDto)
        : domain == 'job'
        ? await this.jobDumpService.create(createDumpDto)
        : domain == 'scholarship'
        ? await this.scholarshipDumpService.create(createDumpDto)
        : await this.retailDumpService.create(createDumpDto);
      sendDataToClients(searchRequestDto?.context?.transaction_id, searchRequestDto?.data, connectedClients);
      return searchRequestDto;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async onSelect(
    searchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transactionId: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      // Dump data to database
      const domain =
        searchRequestDto?.context?.domain === DomainsEnum.COURSE_DOMAIN
          ? 'course'
          : searchRequestDto?.context?.domain === DomainsEnum.JOB_DOMAIN
          ? 'job'
          : searchRequestDto?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN
          ? 'scholarship'
          : 'retail';

      const selectRequestDetails =
        domain == 'course'
          ? await this.courseDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_search')
          : domain == 'job'
          ? await this.jobDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_search')
          : domain == 'scholarship'
          ? await this.scholarshipDumpService.findByTransactionId(
              searchRequestDto?.context?.transaction_id,
              'on_search',
            )
          : await this.retailDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_search');
      // Dump the response into database
      const createDumpDto: CreateDumpDto = {
        context: searchRequestDto?.context,
        transaction_id: searchRequestDto?.context?.transaction_id,
        domain: domain,
        message_id: searchRequestDto?.context?.message_id,
        device_id: selectRequestDetails?.context?.device_id,
        request_type: searchRequestDto?.context?.action,
        message: searchRequestDto?.message,
      };
      domain == 'course'
        ? await this.courseDumpService.create(createDumpDto)
        : domain == 'job'
        ? await this.jobDumpService.create(createDumpDto)
        : domain == 'scholarship'
        ? await this.scholarshipDumpService.create(createDumpDto)
        : await this.retailDumpService.create(createDumpDto);
      sendDataToClients(searchRequestDto?.context?.transaction_id, searchRequestDto?.data, connectedClients);
      return searchRequestDto;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async onInit(
    searchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transactionId: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      // Dump data to database
      const domain =
        searchRequestDto?.context?.domain === DomainsEnum.COURSE_DOMAIN
          ? 'course'
          : searchRequestDto?.context?.domain === DomainsEnum.JOB_DOMAIN
          ? 'job'
          : searchRequestDto?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN
          ? 'scholarship'
          : 'retail';

      const selectRequestDetails =
        domain == 'course'
          ? await this.courseDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_select')
          : domain == 'job'
          ? await this.jobDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_select')
          : domain == 'scholarship'
          ? await this.scholarshipDumpService.findByTransactionId(
              searchRequestDto?.context?.transaction_id,
              'on_select',
            )
          : await this.retailDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_select');
      // Dump the response into database
      const createDumpDto: CreateDumpDto = {
        context: searchRequestDto?.context,
        transaction_id: searchRequestDto?.context?.transaction_id,
        domain: domain,
        message_id: searchRequestDto?.context?.message_id,
        device_id: selectRequestDetails?.context?.device_id,
        request_type: searchRequestDto?.context?.action,
        message: searchRequestDto?.message,
      };
      console.log(createDumpDto, 'dumping on init');
      domain == 'course'
        ? await this.courseDumpService.create(createDumpDto)
        : domain == 'job'
        ? await this.jobDumpService.create(createDumpDto)
        : domain == 'scholarship'
        ? await this.scholarshipDumpService.create(createDumpDto)
        : await this.retailDumpService.create(createDumpDto);
      sendDataToClients(searchRequestDto?.context?.transaction_id, searchRequestDto?.data, connectedClients);
      return searchRequestDto;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async onConfirm(
    searchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transactionId: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      // Dump data to database
      const domain =
        searchRequestDto?.context?.domain === DomainsEnum.COURSE_DOMAIN
          ? 'course'
          : searchRequestDto?.context?.domain === DomainsEnum.JOB_DOMAIN
          ? 'job'
          : searchRequestDto?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN
          ? 'scholarship'
          : 'retail';

      const selectRequestDetails =
        domain == 'course'
          ? await this.courseDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_init')
          : domain == 'job'
          ? await this.jobDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_init')
          : domain == 'scholarship'
          ? await this.scholarshipDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_init')
          : await this.retailDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_init');
      // Dump the response into database
      const createDumpDto: CreateDumpDto = {
        context: searchRequestDto?.context,
        transaction_id: searchRequestDto?.context?.transaction_id,
        domain: domain,
        message_id: searchRequestDto?.context?.message_id,
        device_id: selectRequestDetails?.context?.device_id,
        request_type: searchRequestDto?.context?.action,
        message: searchRequestDto?.message,
      };
      domain == 'course'
        ? await this.courseDumpService.create(createDumpDto)
        : domain == 'job'
        ? await this.jobDumpService.create(createDumpDto)
        : domain == 'scholarship'
        ? await this.scholarshipDumpService.create(createDumpDto)
        : await this.retailDumpService.create(createDumpDto);
      sendDataToClients(searchRequestDto?.context?.transaction_id, searchRequestDto?.data, connectedClients);
      return searchRequestDto;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async onStatus(
    searchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transactionId: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      // Dump data to database
      const domain =
        searchRequestDto?.context?.domain === DomainsEnum.COURSE_DOMAIN
          ? 'course'
          : searchRequestDto?.context?.domain === DomainsEnum.JOB_DOMAIN
          ? 'job'
          : searchRequestDto?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN
          ? 'scholarship'
          : 'retail';

      const selectRequestDetails =
        domain == 'course'
          ? await this.courseDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_confirm')
          : domain == 'job'
          ? await this.jobDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_confirm')
          : domain == 'scholarship'
          ? await this.scholarshipDumpService.findByTransactionId(
              searchRequestDto?.context?.transaction_id,
              'on_confirm',
            )
          : await this.retailDumpService.findByTransactionId(searchRequestDto?.context?.transaction_id, 'on_confirm');
      // Dump the response into database
      const createDumpDto: CreateDumpDto = {
        context: searchRequestDto?.context,
        transaction_id: searchRequestDto?.context?.transaction_id,
        domain: domain,
        message_id: searchRequestDto?.context?.message_id,
        device_id: selectRequestDetails?.context?.device_id,
        request_type: searchRequestDto?.context?.action,
        message: searchRequestDto?.message,
      };
      domain == 'course'
        ? await this.courseDumpService.create(createDumpDto)
        : domain == 'job'
        ? await this.jobDumpService.create(createDumpDto)
        : domain == 'scholarship'
        ? await this.scholarshipDumpService.create(createDumpDto)
        : await this.retailDumpService.create(createDumpDto);
      sendDataToClients(searchRequestDto?.context?.transaction_id, searchRequestDto?.data, connectedClients);
      return searchRequestDto;
    } catch (error) {
      console.log('error', JSON.stringify(error));

      throw error?.response?.data;
    }
  }
}

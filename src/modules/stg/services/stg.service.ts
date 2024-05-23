import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { SearchRequestDto } from '../dto/search-request.dto';
import { GetUrl } from 'src/common/utils/get-urls-utils.service';
import { SelectRequestDto } from '../dto/select-request-dto';
import { InitRequestDto } from '../dto/init-request.dto';
import { ConfirmRequestDto } from '../dto/confirm-request.dto';
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

  async status(statusRequestDto: any) {
    try {
      const searchResponse = (await this.httpService.axiosRef.post(this.getUrl.getStgStatusUrl, statusRequestDto))
        ?.data;
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
      throw error?.response?.data;
    }
  }
}

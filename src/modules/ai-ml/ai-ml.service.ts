import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

import { TranslateDto } from './dto';

import { LatLongDto } from '../../common/utils/dto/lat-long.dto';

import { GetUrl } from 'src/common/utils/get-urls-utils.service';
import { DeviceIdDto } from 'src/common/utils/dto/device-dto';

@Injectable()
export class AiMlService {
  private readonly serverDefaultLanguage: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly getUrl: GetUrl,
    private readonly configService: ConfigService,
  ) {
    this.serverDefaultLanguage = this.configService.get('serverDefaultLanguage');
  }
  // Endpoint to get supported languages
  async getSupportedLanguages(token: string) {
    try {
      return (
        await this.httpService.axiosRef.get(this.getUrl.getSupportedLanguageUrl, { headers: { Authorization: token } })
      )?.data;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  // Endpoint to translate language
  async translateLanguage(token: string, translate: TranslateDto) {
    try {
      return (
        await this.httpService.axiosRef.post(this.getUrl.getTranslateLanguageUrl, translate, {
          headers: { Authorization: token },
        })
      )?.data;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  // Endpoint to get languages for user
  async getLanguagesForUser(latLongDto: LatLongDto) {
    try {
      return (await this.httpService.axiosRef.get(this.getUrl.getLanguagesForUserUrl, { params: latLongDto }))?.data;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  // Endpoint to get focus
  async getDomains(deviceIdDto: DeviceIdDto) {
    try {
      const domains = (await this.httpService.axiosRef.get(this.getUrl.getDomainsUrl, { params: deviceIdDto }))?.data;
      return domains;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  // Endpoint to get focus
  async getCategories(deviceIdDto: DeviceIdDto) {
    try {
      const categories = (await this.httpService.axiosRef.get(this.getUrl.getCategoriesUrl, { params: deviceIdDto }))
        ?.data;
      return categories;
    } catch (error) {
      throw error?.response?.data;
    }
  }
}

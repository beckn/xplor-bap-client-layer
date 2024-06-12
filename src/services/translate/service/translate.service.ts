import { Injectable, Logger } from '@nestjs/common';
import { ItemTranslateDto } from '../dto/translate-item.dto';
import { AxiosService } from '../../../common/axios/axios.service';
import { GetUrl } from '../../../common/utils/get-urls-utils.service';

@Injectable()
export class TranslateService {
  constructor(private readonly httpService: AxiosService, private readonly getUrl: GetUrl) {}
  logger = new Logger(TranslateService.name);
  async translateData(toTranslate: ItemTranslateDto) {
    try {
      this.logger.log('toTranslate', JSON.stringify(toTranslate));
      const response = await this.httpService.post(this.getUrl.getTranslateLanguageUrl, toTranslate);
      this.logger.log('response', response);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

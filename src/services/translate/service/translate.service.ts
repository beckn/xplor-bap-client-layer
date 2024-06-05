import { Injectable } from '@nestjs/common';
import { ItemTranslateDto } from '../dto/translate-item.dto';
import { AxiosService } from '../../../common/axios/axios.service';
import { GetUrl } from '../../../common/utils/get-urls-utils.service';

@Injectable()
export class TranslateService {
  constructor(private readonly httpService: AxiosService, private readonly getUrl: GetUrl) {}

  async translateData(toTranslate: ItemTranslateDto) {
    try {
      const response = await this.httpService.post(this.getUrl.getTranslateLanguageUrl, toTranslate);

      return response;
    } catch (error) {
      throw error;
    }
  }
}

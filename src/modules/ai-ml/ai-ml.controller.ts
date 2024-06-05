import { Controller, Get, Body, Post, Query } from '@nestjs/common';
import { AiMlService } from './ai-ml.service';
import { TranslateDto } from './dto';
import { LatLongDto } from '../../common/utils/dto/lat-long.dto';
import { DeviceIdDto } from '../../common/utils/dto/device-dto';
import { ExtractToken } from '../../common/decorators/extract-token.decorator';

@Controller({ path: 'ai-ml', version: '1' })
export class AiMlController {
  constructor(private readonly aiMlService: AiMlService) {}

  // Endpoint to get supported languages
  @Get('supported-languages')
  getAllSupportedLanguage(@ExtractToken() token: string) {
    return this.aiMlService.getSupportedLanguages(token);
  }

  // Endpoint to translate language
  @Post('translate')
  translateLanguage(@ExtractToken() token: string, @Body() translate: TranslateDto) {
    return this.aiMlService.translateLanguage(token, translate);
  }

  // Endpoint to get languages for user

  @Get('languages')
  getLanguagesForUser(@Query() latLongDto: LatLongDto) {
    return this.aiMlService.getLanguagesForUser(latLongDto);
  }

  // Endpoint to get domains

  @Get('domains')
  getDomains(@Query() deviceIdDto: DeviceIdDto) {
    return this.aiMlService.getDomains(deviceIdDto);
  }

  // Endpoint to get categories

  @Get('categories')
  getCategories(@Query() deviceIdDto: DeviceIdDto) {
    return this.aiMlService.getCategories(deviceIdDto);
  }
}

import { Controller, Get, Query, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { IHealthCheckResponse } from '../../common/interfaces';
import { ExtractToken } from 'src/common/decorators/extract-token.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): IHealthCheckResponse {
    return this.appService.getHealth();
  }

  @Get('/health')
  getHealth(): IHealthCheckResponse {
    return this.appService.getHealth();
  }
  @Get('/applicationForm')
  @Render('applicationForm')
  getApplicationForm() {
    return {};
  }

  @Get('kycForm')
  @Render('kycForm')
  getKycForm(@Query('authToken') authToken: string) {
    return { authToken };
  }
}

import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { IHealthCheckResponse } from 'src/common/interfaces';

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
}

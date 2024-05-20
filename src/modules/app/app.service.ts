import { Injectable } from '@nestjs/common';
import { IHealthCheckResponse } from 'src/common/interfaces';

@Injectable()
export class AppService {
  /**
   * Returns the health status of the application.
   */
  getHealth(): IHealthCheckResponse {
    return { status: 'ok', message: 'Implementation server is up and running' };
  }
}

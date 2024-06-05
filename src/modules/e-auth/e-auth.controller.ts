// Import necessary decorators, services, and DTOs
import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EAuthService } from './e-auth.service';
import { CallBackQueryDto } from './dto/callback-query.dto';
import { ExtractToken } from '../../common/decorators/extract-token.decorator';
import { SseConnectedMessage } from '../../common/constants/response-message';
import { ExtractUserId } from '../../common/decorators/extract-userId';

// Define the EAuthController with necessary routes and decorators
@ApiTags('E-auth')
@Controller({
  version: '1',
  path: 'e-auth',
})
export class EAuthController {
  private readonly logger: Logger = new Logger(EAuthController.name);
  private connectedClients: Map<string, any> = new Map();
  constructor(private readonly eAuthService: EAuthService) {
    this.sendDataToClients = this.sendDataToClients.bind(this);
    if (!this.connectedClients) {
      this.connectedClients = new Map();
    }
  }

  // Route to get list of providers
  @Get()
  getProviders(@ExtractToken() token: string) {
    return this.eAuthService.getProviders(token);
  }

  // Route to update user on callback
  @Get('/callback')
  kycCallbackWebHook(@Query() callBackQueryDto: CallBackQueryDto) {
    return this.eAuthService.updateUserOnCallBack(callBackQueryDto, this.connectedClients, this.sendDataToClients);
  }

  @Get('sse')
  async sse(@ExtractUserId() userId: string, @Req() req: any, @Res() res: any): Promise<void> {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();
    req.setTimeout(0);
    // Extract transaction ID from query parameters
    const token: string = req.query.token;
    // Add the client to the clientsMap
    this.connectedClients.set(userId, res);
    this.sendDataToClients(
      userId,
      {
        success: true,
        message: SseConnectedMessage,
      },
      this.connectedClients,
    );
    // Handle client disconnect
    req.on('close', () => {
      this.connectedClients.get(token)?.end();
      this.connectedClients.delete(token); // Remove the disconnected client
    });
  }
  async sendDataToClients(userId: string, data: any, connectedClients: Map<string, any>): Promise<void> {
    try {
      this.logger.log('sseReceivedData on kyc', data);
      // console.log('connectedClients in sendDataToClients', connectedClients);

      if (connectedClients.has(userId)) {
        // eslint-disable-next-line no-console
        this.logger.log('sseData on kyc', `data: ${JSON.stringify(data)}`);
        // console.log('connectedClients.get(transaction_id)', connectedClients.get(transaction_id));
        connectedClients.get(userId)?.write(`data: ${JSON.stringify(data)}\n\n`);
      }

      return data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}

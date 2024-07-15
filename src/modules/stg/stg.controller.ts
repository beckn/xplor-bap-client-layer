import { StgService } from './services/stg.service';
import { SearchRequestDto } from './dto/search-request.dto';
import { Body, Controller, Get, Injectable, Logger, Post, Query, Req, Res } from '@nestjs/common';
import { SelectRequestDto } from './dto/select-request-dto';
import { InitRequestDto } from './dto/init-request.dto';
import { ConfirmRequestDto } from './dto/confirm-request.dto';
import { PaginationRequestQuery } from './dto/pagination-request.dto';
import { SseConnectedMessage } from '../../common/constants/response-message';
import { ExtractToken } from '../../common/decorators/extract-token.decorator';
import { StatusRequestDto } from './dto/status-request.dto';
import { ExtractUserId } from 'src/common/decorators/extract-userId';
import { RateRequestDto } from './dto/rate-request.dto';
import { CancelRequestDto } from './dto/cancel-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { SupportRequestDto } from './dto/support-request.dto';
import { TrackRequestDto } from './dto/track-request.dto';
import { GclSearchRequestDto } from './dto/gcl-search-request.dto';

@Controller({ version: '1', path: 'stg' })
@Injectable()
export class StgController {
  private connectedClients: Map<string, any> = new Map();
  private readonly logger = new Logger(StgController.name);

  constructor(private readonly stgService: StgService) {
    this.sendDataToClients = this.sendDataToClients.bind(this);
    if (!this.connectedClients) {
      this.connectedClients = new Map();
    }
  }

  @Post('search')
  search(
    @ExtractUserId() userId: string,
    @Query() paginationRequest: PaginationRequestQuery,
    @Body() searchRequestDto: SearchRequestDto,
  ) {
    return this.stgService.search(paginationRequest, searchRequestDto, userId);
  }

  @Post('gcl_search')
  gclSearch(@Body() gclSearchRequestDto: GclSearchRequestDto) {
    return this.stgService.gclSearch(gclSearchRequestDto);
  }

  @Post('on_search')
  onSearch(@Body() onSearchResponse: any) {
    try {
      // Bind the context of sendDataToClients to this instance
      this.logger.log('on_search_data', onSearchResponse);
      this.stgService.onSearch(onSearchResponse, this.connectedClients, this.sendDataToClients);
      return true;
    } catch (error) {
      throw error?.message;
    }
  }

  @Post('select')
  select(@ExtractToken() token: string, @Body() selectRequestDto: SelectRequestDto) {
    return this.stgService.select(token, selectRequestDto);
  }

  @Post('on_select')
  onSelect(@Body() selectResponse: any) {
    try {
      // Bind the context of sendDataToClients to this instance
      this.logger.log('on_select_data', selectResponse);
      this.stgService.onSelect(selectResponse, this.connectedClients, this.sendDataToClients);
      return true;
    } catch (error) {
      throw error?.message;
    }
  }

  @Post('init')
  init(@ExtractToken() token: string, @Body() initRequestDto: InitRequestDto) {
    return this.stgService.init(token, initRequestDto);
  }

  @Post('on_init')
  onInit(@Body() onInitResponse: any) {
    // Bind the context of sendDataToClients to this instance
    this.logger.log('on_init_data', onInitResponse);

    return this.stgService.onInit(onInitResponse, this.connectedClients, this.sendDataToClients);
  }

  @Get('fetch-search-data')
  fetchSearchData() {
    return this.stgService.fetchSearchData();
  }

  @Post('confirm')
  confirm(@ExtractToken() token: string, @Body() confirmRequestDto: ConfirmRequestDto) {
    return this.stgService.confirm(token, confirmRequestDto);
  }

  @Post('status')
  status(@ExtractToken() token: string, @Body() statusRequestDto: StatusRequestDto) {
    return this.stgService.status(token, statusRequestDto);
  }

  @Post('rate')
  rate(@ExtractToken() token: string, @Body() rateRequestDto: RateRequestDto) {
    return this.stgService.rate(token, rateRequestDto);
  }

  @Post('cancel')
  cancel(@ExtractToken() token: string, @Body() cancelRequestDto: CancelRequestDto) {
    return this.stgService.cancel(token, cancelRequestDto);
  }

  @Post('update')
  update(@ExtractToken() token: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.stgService.update(token, updateRequestDto);
  }

  @Post('support')
  support(@ExtractToken() token: string, @Body() supportRequestDto: SupportRequestDto) {
    return this.stgService.support(token, supportRequestDto);
  }

  @Post('track')
  track(@ExtractToken() token: string, @Body() trackRequestDto: TrackRequestDto) {
    return this.stgService.track(token, trackRequestDto);
  }

  @Post('on_confirm')
  onConfirm(@Body() onConfirmResponse: any) {
    // Bind the context of sendDataToClients to this instance
    this.logger.log('onConfirmResponse', onConfirmResponse);
    return this.stgService.onConfirm(onConfirmResponse, this.connectedClients, this.sendDataToClients);
  }

  @Post('on_status')
  onStatus(@Body() statusResponse: any) {
    // Bind the context of sendDataToClients to this instance
    return this.stgService.onStatus(statusResponse, this.connectedClients, this.sendDataToClients);
  }

  @Post('on_rating')
  onRate(@Body() onRatingResponse: any) {
    return this.stgService.onRate(onRatingResponse, this.connectedClients, this.sendDataToClients);
  }

  @Post('on_cancel')
  onCancel(@Body() onCancelResponse: any) {
    return this.stgService.onCancel(onCancelResponse, this.connectedClients, this.sendDataToClients);
  }

  @Post('on_update')
  onUpdate(@Body() onUpdateResponse: any) {
    return this.stgService.onUpdate(onUpdateResponse, this.connectedClients, this.sendDataToClients);
  }

  @Post('on_track')
  onTrack(@Body() onTrackResponse: any) {
    return this.stgService.onTrack(onTrackResponse, this.connectedClients, this.sendDataToClients);
  }

  @Post('on_support')
  onSupport(@Body() onSupportResponse: any) {
    return this.stgService.onTrack(onSupportResponse, this.connectedClients, this.sendDataToClients);
  }

  @Get('sse')
  async sse(@Req() req: any, @Res() res: any): Promise<void> {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();
    req.setTimeout(0);
    // Extract transaction ID from query parameters
    const transaction_id: string = req.query.transaction_id;
    // Add the client to the clientsMap
    this.connectedClients.set(transaction_id, res);
    this.sendDataToClients(
      transaction_id,
      {
        success: true,
        message: SseConnectedMessage,
      },
      this.connectedClients,
    );
    // Handle client disconnect
    req.on('close', () => {
      this.connectedClients.get(transaction_id)?.end();
      this.connectedClients.delete(transaction_id); // Remove the disconnected client
    });
  }

  @Get('subscribe')
  async subscribeToKafka() {
    return await this.stgService.subscribeToCatalogKafka();
  }

  async sendDataToClients(transaction_id: string, data: any, connectedClients: Map<string, any>): Promise<void> {
    try {
      this.logger.log('sseReceivedData', data);
      this.logger.debug('transaction_id', transaction_id);

      if (connectedClients.has(transaction_id)) {
        this.logger.log('sseData', `data: ${JSON.stringify(data)}`);
        connectedClients.get(transaction_id)?.write(`data: ${JSON.stringify(data)}\n\n`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

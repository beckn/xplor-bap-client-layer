import { Body, Controller, Delete, Get, Patch, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { WalletService } from './wallet.service';
import {
  CreateWalletDto,
  GetSharedVcRequestDto,
  QueryWalletVcsDto,
  QueryWalletVcDto,
  ShareVcRequestDto,
  UpdateSharedVcStatusQuery,
  UpdateVcQueryRequestDto,
  WalletQueryDto,
  WalletVcQueryDto,
} from './dto';
import { ExtractToken } from '../../common/decorators/extract-token.decorator';

@Controller({ version: '1', path: 'wallet' })
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // Endpoint to upload a file to the wallet
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileToWallet(
    @ExtractToken() token: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.walletService.uploadFile(token, file, body);
  }

  // Endpoint to get wallet verifiable credentials (VCs)
  @Get('vcs')
  getWalletVcs(@ExtractToken() token: string, @Query() walletVcQueryDto: WalletVcQueryDto) {
    return this.walletService.getWalletVcs(token, walletVcQueryDto);
  }

  // Endpoint to get wallet verifiable credentials (VCs)
  @Get('vc')
  getWalletVc(@ExtractToken() token: string, @Query() walletVcQueryDto: QueryWalletVcDto) {
    return this.walletService.getWalletVc(token, walletVcQueryDto);
  }

  // Endpoint to get wallet verifiable credentials (VCs)
  @Delete('vc')
  deleteWalletVcs(@ExtractToken() token: string, @Query() walletVcQueryDto: QueryWalletVcsDto) {
    return this.walletService.deleteWalletVc(token, walletVcQueryDto);
  }

  // Endpoint to get wallet verifiable credentials (VCs)
  @Get('vc/shared/requests')
  async getShareRequests(@ExtractToken() token: string, @Query() queries: GetSharedVcRequestDto) {
    return await this.walletService.getVcSharedRequestsList(token, queries);
  }

  // Endpoint to udpate wallet verifiable credentials share recored(VCs)
  @Patch('vc/shared/requests/update')
  async updateShareVc(
    @ExtractToken() token: string,
    @Query() queryParams: UpdateVcQueryRequestDto,
    @Body() body: ShareVcRequestDto,
  ) {
    return await this.walletService.updateShareVc(token, queryParams, body);
  }

  @Patch('vc/shared/requests/status')
  async updateShareVcStatus(@ExtractToken() token: string, @Query() queryParams: UpdateSharedVcStatusQuery) {
    return await this.walletService.updateShareVcStatus(token, queryParams);
  }

  // Endpoint to share wallet verifiable credentials (VCs)
  @Put('vc/share')
  async shareVc(
    @ExtractToken() token: string,
    @Query() queryParams: QueryWalletVcsDto,
    @Body() body: ShareVcRequestDto,
  ) {
    return await this.walletService.shareVc(token, queryParams, body);
  }

  // Endpoint to get wallet details
  @Get()
  getWallet(@ExtractToken() token: string, @Query() walletQueryDto: WalletQueryDto) {
    return this.walletService.getWalletDetails(token, walletQueryDto);
  }

  // Endpoint to create a new wallet
  @Post()
  createWallet(@ExtractToken() token: string, @Body() createWalletDto: CreateWalletDto) {
    return this.walletService.createWallet(token, createWalletDto);
  }

  // Endpoint to delete a wallet
  @Delete()
  deleteWallet(@ExtractToken() token: string, @Query() walletQueryDto: WalletQueryDto) {
    return this.walletService.deleteWallet(token, walletQueryDto);
  }
}

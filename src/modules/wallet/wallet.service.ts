import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

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
import { WALLET_ERROR_MESSAGES } from '../../common/constants/error-message';
import { GetUrl } from '../../common/utils/get-urls-utils.service';

@Injectable()
export class WalletService {
  private readonly logger: Logger;

  // Constructor to inject dependencies
  constructor(private readonly httpService: HttpService, private readonly getUrl: GetUrl) {
    this.logger = new Logger(WalletService.name);
  }

  // Method to create a new wallet
  async createWallet(token: string, createWalletDto: CreateWalletDto) {
    try {
      // Make a POST request to create a wallet
      const walletData = (
        await this.httpService.axiosRef.post(this.getUrl.getWalletUrl, createWalletDto, {
          headers: { Authorization: token },
        })
      )?.data;

      return walletData?.data;
    } catch (error) {
      // Log the error and return the error response
      this.logger.error(WALLET_ERROR_MESSAGES.CREATE_WALLET, error);
      throw error?.response?.data;
    }
  }

  // Method to delete a wallet
  async deleteWallet(token: string, walletQueryDto: WalletQueryDto) {
    try {
      // Make a DELETE request to delete a wallet
      const walletData = (
        await this.httpService.axiosRef.delete(this.getUrl.getWalletUrl, {
          params: walletQueryDto,
          headers: { Authorization: token },
        })
      )?.data;
      return walletData;
    } catch (error) {
      // Log the error and return the error response
      this.logger.error(WALLET_ERROR_MESSAGES.DELETE_WALLET, error);
      throw error?.response?.data;
    }
  }

  // Method to get wallet details
  async getWalletDetails(token: string, walletQueryDto: WalletQueryDto) {
    try {
      // Make a GET request to fetch wallet details
      const walletData = (
        await this.httpService.axiosRef.get(this.getUrl.getWalletUrl, {
          params: walletQueryDto,
          headers: { Authorization: token },
        })
      )?.data;
      return walletData;
    } catch (error) {
      // Log the error and return the error response
      this.logger.error(WALLET_ERROR_MESSAGES.GET_WALLET_DETAILS, error);
      throw error?.response?.data;
    }
  }

  // Method to get wallet verifiable credentials (VCs)
  async getWalletVcs(token: string, walletVcQueryDto: WalletVcQueryDto) {
    try {
      // Make a GET request to fetch wallet VCs
      const walletData = (
        await this.httpService.axiosRef.get(this.getUrl.getWalletVcsUrl, {
          params: walletVcQueryDto,
          headers: { Authorization: token },
        })
      ).data;
      return walletData;
    } catch (error) {
      // Log the error and return the error response
      this.logger.error(WALLET_ERROR_MESSAGES.GET_WALLET_VCS, error);
      throw error?.response?.data;
    }
  }
  async getWalletVc(token: string, walletVcQueryDto: QueryWalletVcDto) {
    try {
      // Make a GET request to fetch wallet VCs
      const walletData = (
        await this.httpService.axiosRef.get(this.getUrl.getWalletVcUrl, {
          params: walletVcQueryDto,
          headers: { Authorization: token },
        })
      )?.data;
      return walletData;
    } catch (error) {
      // Log the error and return the error response
      this.logger.error(WALLET_ERROR_MESSAGES.GET_WALLET_VC, error);
      throw error?.response?.data;
    }
  }
  // Method to delete wallet verifiable credentials (VC)
  async deleteWalletVc(token: string, walletVcQueryDto: QueryWalletVcsDto) {
    try {
      // Make a GET request to fetch wallet VCs
      const walletData = (
        await this.httpService.axiosRef.delete(this.getUrl.getWalletVcUrl, {
          params: walletVcQueryDto,
          headers: { Authorization: token },
        })
      )?.data;
      return walletData;
    } catch (error) {
      // Log the error and return the error response
      this.logger.error(WALLET_ERROR_MESSAGES.DELETE_WALLET_VC, error);
      throw error?.response?.data;
    }
  }

  // Method to upload a file to the wallet
  async uploadFile(token: string, file: Express.Multer.File, body: any) {
    try {
      // Prepare the form data for file upload
      const fileBuffer = file.buffer;
      const blob = new Blob([fileBuffer], { type: file.mimetype });
      const formData = new FormData();
      formData.append('file', blob, file.originalname);
      formData.append('walletId', body.walletId);
      formData.append('category', body.category);
      const bodyTags = body.tags;
      bodyTags.map((tag: string, i: number) => {
        formData.append(`tags[${i}]`, tag);
      });

      formData.append('iconUrl', body.iconUrl);
      formData.append('name', body.name);
      // formData.append('metadata', JSON.stringify(body.metadata));

      // Make a POST request to upload the file
      const response = (
        await this.httpService.axiosRef.post(this.getUrl.getVcWalletFileUploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token,
          },
        })
      )?.data;

      return response;
    } catch (error) {
      // Log the error and throw it
      this.logger.error(WALLET_ERROR_MESSAGES.UPLOAD_FILE, error);
      throw error?.response?.data;
    }
  }

  // Method to upload a file to the wallet
  async uploadCertificate(token: string, body: any) {
    try {
      const formData = new FormData();
      formData.append('walletId', body.walletId);
      formData.append('category', body.category);
      const bodyTags = body.tags;
      bodyTags.map((tag: string, i: number) => {
        formData.append(`tags[${i}]`, tag);
      });

      formData.append('iconUrl', body.iconUrl);
      formData.append('name', body.name);
      formData.append('fileUrl', body.fileUrl);
      // formData.append('metadata', JSON.stringify(body.metadata));

      // Make a POST request to upload the file
      const response = (
        await this.httpService.axiosRef.post(this.getUrl.getVcWalletCertificateUploadUrl, formData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        })
      )?.data;

      return response;
    } catch (error) {
      // Log the error and throw it
      this.logger.error(WALLET_ERROR_MESSAGES.UPLOAD_FILE, error);
      throw error?.response?.data;
    }
  }

  async shareVc(token: string, queryParams: QueryWalletVcsDto, body: ShareVcRequestDto) {
    try {
      // Make a POST request to share a VC
      const vcData = (
        await this.httpService.axiosRef.put(this.getUrl.getShareVcUrl, body, {
          params: queryParams,
          headers: { Authorization: token },
        })
      ).data;
      return vcData;
    } catch (error) {
      // Log the error and throw it
      this.logger.error(WALLET_ERROR_MESSAGES.SHARE_VC, error);
      throw error?.response?.data;
    }
  }
  async updateShareVc(token: string, queryParams: UpdateVcQueryRequestDto, body: ShareVcRequestDto) {
    try {
      // Make a PATCH request to share a VC
      const vcData = (
        await this.httpService.axiosRef.patch(this.getUrl.updateSharedVcUrl, body, {
          params: queryParams,
          headers: { Authorization: token },
        })
      )?.data;
      return vcData;
    } catch (error) {
      // Log the error and throw it
      this.logger.error(WALLET_ERROR_MESSAGES.UPDATE_SHARE_VC, error);
      throw error?.response?.data;
    }
  }

  async updateShareVcStatus(token: string, queryParams: UpdateSharedVcStatusQuery) {
    try {
      // Make a PATCH request to share a VC
      const vcData = (
        await this.httpService.axiosRef.patch(
          this.getUrl.updateSharedVcStatusUrl,
          {},
          { params: queryParams, headers: { Authorization: token } },
        )
      )?.data;
      return vcData;
    } catch (error) {
      // Log the error and throw it
      this.logger.error(WALLET_ERROR_MESSAGES.UPDATE_SHARE_VC_STATUS, error);
      throw error?.response?.data;
    }
  }

  async getVcSharedRequestsList(token: string, queries: GetSharedVcRequestDto) {
    try {
      // Make a GET request to fetch VC shared requests
      const vcData = (
        await this.httpService.axiosRef.get(this.getUrl.getSharedVcUrl, {
          params: queries,
          headers: { Authorization: token },
        })
      )?.data;
      return vcData;
    } catch (error) {
      // Log the error and throw it
      this.logger.error(WALLET_ERROR_MESSAGES.GET_VC_SHARED_REQUESTS_LIST, error);
      throw error?.response?.data;
    }
  }
}

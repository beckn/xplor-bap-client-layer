import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Endpoints } from '../constants/endpoint';

// import { Endpoints } from '../constants/endpoint'; // Assuming 'endpoints' file path

/**
 * A service to get various URLs used across the application for eAuth, Wallet, and User services.
 */
@Injectable()
export class GetUrl extends ConfigService {
  // URLs from environment variables.
  coreServiceUrl = this.get('coreServiceUrl');
  getProvidersUrl = this.coreServiceUrl + Endpoints.getProviderUrl;
  getStgSearchUrl = this.coreServiceUrl + Endpoints.getStgSearchUrl;
  getStgSelectUrl = this.coreServiceUrl + Endpoints.getStgSelectUrl;

  getStgInitUrl = this.coreServiceUrl + Endpoints.getStgInitUrl;
  getStgConfirmUrl = this.coreServiceUrl + Endpoints.getStgConfirmUrl;
  getStgStatusUrl = this.coreServiceUrl + Endpoints.getStgStatusUrl;

  getWalletUrl = this.coreServiceUrl + Endpoints.getWalletUrl;
  getWalletVcsUrl = this.coreServiceUrl + Endpoints.getWalletVcsUrl;
  getWalletVcUrl = this.coreServiceUrl + Endpoints.getWalletVcUrl;
  getVcWalletFileUploadUrl = this.coreServiceUrl + Endpoints.getVcWalletFileUploadUrl;
  getShareVcUrl = this.coreServiceUrl + Endpoints.getShareVcUrl;
  getSharedVcUrl = this.coreServiceUrl + Endpoints.getSharedVcUrl;
  updateSharedVcUrl = this.coreServiceUrl + Endpoints.updateSharedVcUrl;
  updateSharedVcStatusUrl = this.coreServiceUrl + Endpoints.updateSharedVcStatusUrl;
  getUserProfileUrl = this.coreServiceUrl + Endpoints.getUserProfileUrl;
  getUserJourneyUrl = this.coreServiceUrl + Endpoints.getUserJourneyUrl;
  getRolesUrl = this.coreServiceUrl + Endpoints.getRolesUrl;
  getAssignRoleUrl = this.coreServiceUrl + Endpoints.getAssignRoleUrl;
  getUserSendOtpUrl = this.coreServiceUrl + Endpoints.getUserSendOtpUrl;
  getUserSendMpinOtpUrl = this.coreServiceUrl + Endpoints.getUserSendMpinOtpUrl;
  getUserVerifyOtpUrl = this.coreServiceUrl + Endpoints.getUserVerifyOtpUrl;
  getUserResetMpinUrl = this.coreServiceUrl + Endpoints.getUserResetMpinUrl;
  createUserMPinUrl = this.coreServiceUrl + Endpoints.createUserMPinUrl;
  verifyUserMPinUrl = this.coreServiceUrl + Endpoints.verifyUserMPinUrl;
  refreshUserTokenUrl = this.coreServiceUrl + Endpoints.refreshUserTokenUrl;
  logOutUserUrl = this.coreServiceUrl + Endpoints.logOutUserUrl;
  updateUserLanguagePreferenceUrl = this.coreServiceUrl + Endpoints.updateUserLanguagePreferenceUrl;
  getDevicePreferenceUrl = this.coreServiceUrl + Endpoints.getDevicePreferenceUrl;
}

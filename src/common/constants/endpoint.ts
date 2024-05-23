/**
 * Constants for various API endpoints used throughout the application.
 */
export const Endpoints = {
  getProviderUrl: '/api/v1/e-auth',
  getStgSearchUrl: '/api/v1/stg/search',
  getStgSelectUrl: '/api/v1/stg/select',
  getStgInitUrl: '/api/v1/stg/init',
  getStgConfirmUrl: '/api/v1/stg/confirm',
  getStgStatusUrl: '/api/v1/stg/status',

  getWalletUrl: '/api/v1/wallet',
  getWalletVcsUrl: '/api/v1/wallet/vcs',
  getWalletVcUrl: '/api/v1/wallet/vc',
  getVcWalletFileUploadUrl: '/api/v1/wallet/file',
  getShareVcUrl: '/api/v1/wallet/vc/share',
  getSharedVcUrl: '/api/v1/wallet/vc/shared/requests',
  updateSharedVcUrl: '/api/v1/wallet/vc/shared/requests/update',
  updateSharedVcStatusUrl: '/api/v1/wallet/vc/shared/requests/status',
  getUserProfileUrl: '/api/v1/user',
  getUserJourneyUrl: '/api/v1/user/journey',
  getRolesUrl: '/api/v1/user/roles',
  getAssignRoleUrl: '/api/v1/user/role',
  getUserSendOtpUrl: '/api/v1/user/send-otp',
  getUserSendMpinOtpUrl: '/api/v1/user/send-mpin-otp',
  getUserVerifyOtpUrl: '/api/v1/user/verify-otp',
  getUserResetMpinUrl: '/api/v1/user/reset-mpin',
  createUserMPinUrl: '/api/v1/user/create-mpin',
  verifyUserMPinUrl: '/api/v1/user/verify-mpin',
  refreshUserTokenUrl: '/api/v1/user/access-token',
  logOutUserUrl: '/api/v1/user/logout',
  updateUserLanguagePreferenceUrl: '/api/v1/user/language-preference',
  getDevicePreferenceUrl: '/api/v1/user/device-preference',
};

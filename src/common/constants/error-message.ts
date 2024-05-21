// Define a constant object for general error messages
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error', // Message for internal server errors
  AXIOS_REQUEST_FAILED: 'Axios request failed', // Message for failed Axios requests
  BAD_REQUEST: 'Bad Request', // Message for bad request errors
  UNAUTHORIZED: 'Unauthorized', // Message for unauthorized access errors
  FORBIDDEN: 'Forbidden', // Message for forbidden access errors
  NOT_FOUND: 'Not Found', // Message for not found errors
  TOKEN_MISSING: 'Token Missing', // Message for missing token
};

// Define a constant object for HTTP status codes
export const STATUS_CODES = {
  INTERNAL_SERVER_ERROR: 500, // HTTP status code for internal server errors
  BAD_REQUEST: 400, // HTTP status code for bad request errors
  UNAUTHORIZED: 401, // HTTP status code for unauthorized access errors
  FORBIDDEN: 403, // HTTP status code for forbidden access errors
  NOT_FOUND: 404, // HTTP status code for not found errors
};

// Define a constant object for wallet-specific error messages
export const WALLET_ERROR_MESSAGES = {
  UPLOAD_FILE: 'Error in  uploading file', // Message for errors during file upload
  CREATE_WALLET: 'Error in creating wallet', // Message for errors during wallet creation
  DELETE_WALLET: 'Error in deleting wallet', // Message for errors during wallet deletion
  GET_WALLET_DETAILS: 'Error in fetching wallet details', // Message for errors during fetching wallet details
  GET_WALLET_VCS: 'Error in fetching wallet vcs', // Message for errors during fetching wallet VCs
  GET_WALLET_VC: 'Error in fetching wallet vcs', // Message for errors during fetching a specific wallet VC
  DELETE_WALLET_VC: 'Error in deleting wallet vc', // Message for errors during deleting a wallet VC
  SHARE_VC: 'Error in sharing VC', // Message for errors during sharing a VC
  UPDATE_SHARE_VC: 'Error in updating share VC', // Message for errors during updating a shared VC
  UPDATE_SHARE_VC_STATUS: 'Error in updating share VC status', // Message for errors during updating the status of a shared VC
  GET_VC_SHARED_REQUESTS_LIST: 'Error in fetching VC shared requests', // Message for errors during fetching VC shared requests
};

export const USER_ERROR_MESSAGES = {
  SEND_OTP: 'Error in sending OTP', // Message for errors during sending OTP
  VERIFY_OTP: 'Error in verifying OTP', // Message for errors during verifying OTP
  RESEND_OTP: 'Error in resending OTP', // Message for errors during resending OTP
  VERIFY_TOKEN: 'Error in verifying token', // Message for errors during verifying token
  CREATE_USER: 'Error in creating user', // Message for errors during creating user
  CREATE_USER_MPIN: 'Error in creating user mpin', // Message for errors during creating user mpin
  VERIFY_USER_MPIN: 'Error in verifying user mpin', // Message for errors during verifying user mpin
  UPDATE_USER_KYC: 'Error in updating user kyc', // Message for errors during updating user kyc
  GET_USER_JOURNEY: 'Error in fetching user journey', // Message for errors during fetching user journey
  GET_USER_DETAILS: 'Failed to fetch userDetails', // Message for errors during fetching user details
  ASSIGN_USER_ROLE: 'Error in assigning user role', // Message for errors during assigning user role
  GET_USER_ROLES: 'Error in fetching user roles', // Message for errors during fetching user roles
  UPDATER_USER_MPIN: 'Error in updating user mpin', // Message for errors during updating user mpin
  UPDATE_USER_LANGUAGE_PREFERENCE: 'Error in updating user language preference', // Message for errors during updating user language preference
  CREATE_DEVICE_PREFERENCE: 'Error in creating device preference for device', // Message for errors creating device  preference
  UPDATE_DEVICE_PREFERENCE: 'Error in updating device preference for device', //  Message for errors updating device  preference
  GET_DEVICE_PREFERENCE: 'Error in fetching device preference for device', //  Message for errors fetching device  preference
};

export const EAUTH_ERROR_MESSAGES = {
  GET_USER_DETAILS: 'Failed to fetch userDetails', // Message for errors during fetching user details from eAuth
  GET_PROVIDERS: 'Failed to fetch providers', // Message for errors during fetching providers from eAuth
  GET_ACCESS_TOKEN: 'Failed to fetch accessToken', // Message for errors during fetching access token from eAuth
};

// Define a constant object for general error messages
export const DEVICE_ERROR_MESSAGES = {
  DEVICE_ID_REQUIRED: 'Device id is required', //Device id is required message
};

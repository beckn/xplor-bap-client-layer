/**
 * Interface for token details.
 */
interface ITokenDetails {
  /**
   * Access token.
   */
  access_token: string;

  /**
   * Token expiration time in seconds.
   */
  expires_in: number;

  /**
   * Type of the token.
   */
  token_type: string;

  /**
   * Scope of the token.
   */
  scope: string;

  /**
   * Consent validity time in seconds.
   */
  consent_valid_till: number;

  /**
   * ID token.
   */
  id_token: string;

  /**
   * Refresh token.
   */
  refresh_token: string;
}

/**
 * Interface for user details.
 */
interface IUserDetails {
  /**
   * Given name of the user.
   */
  given_name: string;

  /**
   * Preferred username of the user.
   */
  preferred_username: string;

  /**
   * Email address of the user.
   */
  email: string;

  /**
   * Birthdate of the user.
   */
  birthdate: string;

  /**
   * Phone number of the user.
   */
  phone_number: string;

  /**
   * User's SSO ID.
   */
  user_sso_id: string;

  /**
   * PAN number of the user.
   */
  pan_number: string;

  /**
   * Driving license number of the user.
   */
  driving_licence: string;

  /**
   * Masked Aadhaar number of the user.
   */
  masked_aadhaar: string;

  /**
   * Digilocker ID of the user.
   */
  digilockerid: string;

  /**
   * Verification status of the user.
   */
  verified: boolean;
}

/**
 * Interface combining token details and user details.
 */
export interface ITokenAndUserDetails {
  /**
   * Token details.
   */
  tokenDetails: ITokenDetails;

  /**
   * User details.
   */
  userDetails: IUserDetails;
}

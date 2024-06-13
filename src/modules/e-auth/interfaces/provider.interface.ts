/**
 * Interface for provider details.
 */
export interface IProvider {
  /**
   * Unique code for the provider.
   */
  code: string;

  /**
   * Link to the provider's icon.
   */
  iconLink: string;

  /**
   * Title of the provider.
   */
  title: string;

  /**
   * Subtitle or additional information about the provider.
   */
  subTitle: string;

  /**
   * URL to redirect to for authentication.
   */
  redirectUrl: string;
}

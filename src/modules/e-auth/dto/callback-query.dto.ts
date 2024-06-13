import { IsOptional } from 'class-validator';
import { PROVIDERS } from '../../../common/constants/providers';

/**
 * Data Transfer Object (DTO) for handling callback queries.
 * This DTO is used to validate the data received from a callback query,
 * such as authorization code, state, and provider information.
 */
export class CallBackQueryDto {
  /**
   * The authorization code received from the callback query.
   * This is optional and may not be present in all callback queries.
   */
  @IsOptional()
  code?: string;

  /**
   * The state parameter received from the callback query.
   * This is optional and may not be present in all callback queries.
   */
  @IsOptional()
  state?: string;

  /**
   * The provider information received from the callback query.
   * This is optional and defaults to 'digilocker' if not provided.
   */
  @IsOptional()
  provider?: string = PROVIDERS.DIGILOCKER;
}

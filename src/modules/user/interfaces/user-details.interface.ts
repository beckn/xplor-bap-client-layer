import { ApiProperty } from '@nestjs/swagger';

// Interfaces for user details, persona, and e-authentication details
import { AuthMethod } from '../enums/auth-method.enum';

// Interface for user details including personal information
export interface UserDetails {
  given_name: string; // Given name of the user
  preferred_username: string; // Preferred username of the user
  email: string; // Email address of the user
  birthdate: string; // Birthdate of the user
  phone_number: string; // Phone number of the user
  user_sso_id: string; // SSO ID of the user
  pan_number: string; // PAN number of the user
  driving_licence: string; // Driving licence of the user
  masked_aadhaar: string; // Masked Aadhaar number of the user
}

// Interface for persona details including interests and choices
export interface Persona {
  interest?: string[]; // Array of interests
  choice?: string[]; // Array of choices
}

// Interface for e-authentication details including method, verification status, and token
export interface EAuth {
  method: AuthMethod; // Authentication method used
  verified: boolean; // Verification status of the e-authentication
  token: {
    access_token?: string; // Access token
    expires_in?: number; // Token expiration time
    token_type?: string; // Token type
    scope?: string; // Scope of the token
    consent_valid_till?: number; // Consent validity till
    id_token?: string; // ID token
  };
}

// Corresponding classes implementing the interfaces for use with class-transformer and NestJS Swagger
export class UserDetailsClass implements UserDetails {
  given_name: string;
  preferred_username: string;
  email: string;
  birthdate: string;
  phone_number: string;
  user_sso_id: string;
  pan_number: string;
  driving_licence: string;
  masked_aadhaar: string;
}

export class PersonaClass implements Persona {
  @ApiProperty({ example: ['interest1', 'interest2'], type: [String] })
  interest?: string[];
  @ApiProperty({ example: ['choice1', 'choice2'], type: [String] })
  choice?: string[];
}

export class EAuthClass implements EAuth {
  method: AuthMethod;
  verified: boolean;
  token: {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
    consent_valid_till?: number;
    id_token?: string;
  };
}

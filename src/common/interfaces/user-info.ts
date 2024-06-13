export interface IUserInfo {
  _id?: string;
  phoneNumber?: string;
  profileUrl?: string;
  countryCode?: string;
  verified?: boolean;
  kycStatus?: boolean;
  persona?: any; // Specify a more detailed type if possible
  role?: Role;
  kyc?: KYC;
  wallet?: any; // Specify a more detailed type if possible
  mPin?: string;
  languagePreference?: string;
  domains?: Domain[];
  categories?: Category[];
  accessTokenExpiry?: string;
  refreshTokenExpiry?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface Role {
  _id?: string;
  type?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface KYC {
  lastName?: string;
  firstName?: string;
  address?: string;
  email?: string;
  dob?: string;
  gender?: string;
  provider?: Provider;
  _id?: string;
  updated_at?: string;
  created_at?: string;
}

interface Provider {
  id?: string;
  name?: string;
}

interface Domain {
  _id?: string;
  title?: string;
  domain?: string;
  description?: string;
  icon?: string;
  __v?: number;
}

interface Category {
  _id?: string;
  title?: string;
  value?: string;
  __v?: number;
}

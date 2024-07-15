interface Context {
  domain: string;
  action: string;
  version: string;
  bpp_id: string;
  bpp_uri: string;
  country: string;
  city: string;
  location: Location;
  bap_id: string;
  bap_uri: string;
  transaction_id: string;
  message_id: string;
  ttl: string;
  timestamp: string;
}

interface Location {
  country: Country;
  city: City;
}

interface Country {
  name: string;
  code: string;
}

interface City {
  name: string;
  code: string;
}

interface Message {
  name: string;
  providers: GclProvider[];
}

export interface GclProvider {
  id: string;
  name: string;
  short_desc: string;
  long_desc: string;
  locations: ProviderLocation[];
  items: GclItems[];
  images: Image[];
}

interface ProviderLocation {
  id: string;
  gps?: string;
  address?: string;
  city?: CityName;
  country?: CountryName;
  state?: StateName;
  area_code: string;
}

interface CityName {
  name: string;
}

interface CountryName {
  name: string;
}

interface StateName {
  name: string;
}

export interface Descriptor {
  name: string;
  long_desc?: string;
  short_desc?: string;
  images?: { url: string; size_type?: string }[];
}

export interface GclTransformedItem {
  transaction_id: string;
  domain: string;
  item_id: string;
  descriptor: Descriptor;
  price: Price;
  provider_id: string;
  provider: Descriptor;
  creator: Descriptor;
  tags: Tag[];
  rating: string;
  bpp_id: string;
  bpp_uri: string;
  rateable: boolean;
}

export interface GclItems {
  id: string;
  short_desc: string;
  long_desc: string;
  name: string;
  price: Price;
  creator: Descriptor;
  fulfillments: Fulfillment[];
  images: Image[];
  rating: string;
  rateable: boolean;
  tags: Tag[];
  quantity: Quantity;
}

interface Price {
  value: string;
  currency: string;
}

interface Fulfillment {
  id: string;
  type: string;
  tracking: boolean;
  tags: Tag[];
}

export interface Tag {
  display: boolean;
  list: TagList[];
}

interface TagList {
  code: string;
  value: string;
}

interface Image {
  url: string;
}

interface Quantity {
  available: Available;
}

interface Available {
  count: number;
}

export interface DsepCoursesSearchResponse {
  context: Context;
  message: Message;
}

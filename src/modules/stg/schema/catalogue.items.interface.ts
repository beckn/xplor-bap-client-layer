interface Descriptor {
  name: string;
  long_desc?: string;
  short_desc?: string;
  images?: { url: string; size_type?: string }[];
}

interface Price {
  currency: string;
  value: string;
}

export interface TransformedItem {
  transaction_id: string;
  domain: string;
  item_id: string;
  descriptor: Descriptor;
  price: Price;
  provider_id: string;
  provider: Descriptor;
}

export interface Item {
  id: string;
  quantity?: { maximum: { count: { $numberInt: string } } };
  descriptor: Descriptor;
  creator?: { descriptor: Descriptor };
  price: Price;
  category_ids?: string[];
  fulfillment_ids?: string[];
  rating?: string;
  rateable?: boolean;
  tags?: {
    descriptor: { code: string; name: string };
    list: { descriptor: { code: string; name: string }; value: string }[];
    display?: boolean;
  }[];
}

export interface Provider {
  id: string;
  descriptor: Descriptor;
  categories?: { id: string; descriptor: Descriptor }[];
  fulfillments?: { id: string; type: string; tracking: boolean }[];
  items: Item[];
}

interface Catalog {
  descriptor: Descriptor;
  providers: Provider[];
}

interface Message {
  catalog: Catalog;
}

interface Context {
  domain: string;
  transaction_id: string;
}

export interface RawCatalogueData {
  context: Context;
  message: Message;
}

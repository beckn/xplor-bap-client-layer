import { Item, Provider, RawCatalogueData, TransformedItem } from '../modules/stg/schema/catalogue.items.interface';
import {
  DsepCoursesSearchResponse,
  GclItems,
  GclProvider,
  GclTransformedItem,
  Tag,
} from '../modules/stg/schema/gcl-catalogue.items.interface';

export const getTransformedItems = (data: RawCatalogueData): TransformedItem[] => {
  const transactionId = data.context.transaction_id;
  const providers = data.message.catalog.providers;
  const domain = data.context.domain;
  const result: TransformedItem[] = [];

  providers.forEach((provider: Provider) => {
    provider.items.forEach((item: Item) => {
      result.push({
        transaction_id: transactionId,
        domain: domain,
        item_id: item.id,
        descriptor: {
          name: item?.descriptor?.name,
          images: item?.descriptor?.images,
          long_desc: item?.descriptor?.long_desc?.replace(/<[^>]*>/g, ''),
          short_desc: item?.descriptor?.short_desc?.replace(/<[^>]*>/g, ''),
        },
        price: item.price,
        provider_id: provider.id,
        provider: {
          name: provider?.descriptor?.name,
          images: provider?.descriptor?.images,
          long_desc: provider?.descriptor?.long_desc?.replace(/<[^>]*>/g, ''),
          short_desc: provider?.descriptor?.short_desc?.replace(/<[^>]*>/g, ''),
        },
        rating: item.rating,
        rateable: item.rateable,
        creator: {
          name: item?.creator?.descriptor?.name,
          images: item?.creator?.descriptor?.images,
          long_desc: item?.creator?.descriptor?.long_desc,
          short_desc: item?.creator?.descriptor?.short_desc,
        },
        bpp_id: item.bpp_id,
        bpp_uri: item.bpp_uri,
        tags: item.tags,
      });
    });
  });

  return result;
};

export const transformGclItems = (data: DsepCoursesSearchResponse): GclTransformedItem[] => {
  const transactionId = data.context.transaction_id;
  const bpp_id = data.context.bpp_id;
  const bpp_uri = data.context.bpp_uri;
  const providers = data.message.providers;
  const domain = data.context.domain;
  const result: GclTransformedItem[] = [];

  providers.forEach((provider: GclProvider) => {
    provider.items.forEach((item: GclItems) => {
      const itemTags: Tag[] = [];
      item?.fulfillments?.forEach((fulfillment) => {
        fulfillment?.tags?.forEach((tag) => {
          itemTags.push(tag);
        });
      });
      result.push({
        transaction_id: transactionId,
        domain: domain,
        item_id: item.id,
        descriptor: {
          name: item?.name,
          images: item?.images,
          long_desc: item?.long_desc?.replace(/<[^>]*>/g, ''),
          short_desc: item?.short_desc?.replace(/<[^>]*>/g, ''),
        },
        price: item.price,
        provider_id: provider.id,
        provider: {
          name: provider?.name,
          images: provider?.images,
          long_desc: provider?.long_desc?.replace(/<[^>]*>/g, ''),
          short_desc: provider?.short_desc?.replace(/<[^>]*>/g, ''),
        },
        rating: item.rating,
        rateable: item.rateable,
        creator: {
          name: item?.creator?.name ?? 'John Doe',
          images: item?.creator?.images ?? [],
          long_desc: item?.creator?.long_desc ?? 'Creator long description.',
          short_desc: item?.creator?.short_desc ?? 'Creator short description.',
        },
        bpp_id: bpp_id,
        bpp_uri: bpp_uri,
        tags: itemTags,
      });
    });
  });
  return result;
};

export function stringToBool(str) {
  return str?.toString().toLowerCase() === 'true';
}

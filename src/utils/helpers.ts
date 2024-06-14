import { Item, Provider, RawCatalogueData, TransformedItem } from '../modules/stg/schema/catalogue.items.interface';

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
        tags: item.tags,
      });
    });
  });

  return result;
};

export function stringToBool(str) {
  return str?.toString().toLowerCase() === 'true';
}

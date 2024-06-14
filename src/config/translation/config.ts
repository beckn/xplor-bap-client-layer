import { Languages } from '../../common/constants/enums';

export const translationConfig = {
  enable: true,
  useAsync: false,
  defaultLanguage: Languages.ENGLISH,
  supportedLanguages: [Languages.ENGLISH, Languages.HINDI, Languages.PUNJABI, Languages.PORTUGUESE, Languages.SPANISH],
  catalogConfig: {
    keysToExclude: [
      'item_id',
      'item_provider_id',
      'description.images',
      'descriptor.media',
      'transaction_id',
      'item_domain',
      'item_provider_images',
      'item_media',
      'item_images',
      'provider_images',
      'tag_code',
      'tag_name',
      'code',
      'tag_display',
      'item_transaction_id',
      'item_rating',
      'item_rateable',
      'creator_images',
      'provider_id',
    ],
  },
};

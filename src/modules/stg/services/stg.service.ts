import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidV4 } from 'uuid';

import { SearchRequestDto } from '../dto/search-request.dto';
import { SelectRequestDto } from '../dto/select-request-dto';
import { InitRequestDto } from '../dto/init-request.dto';
import { ConfirmRequestDto } from '../dto/confirm-request.dto';
import { StatusRequestDto } from '../dto/status-request.dto';
import { AxiosService } from '../../../common/axios/axios.service';
import { Languages, DomainsEnum } from '../../../common/constants/enums';
import { GetUrl } from '../../../common/utils/get-urls-utils.service';
import { RequestPayloadUtilsService } from '../../../common/utils/request-payload.utils.service';
import { ResponsePayloadUtilsService } from '../../../common/utils/response-payload.utils.service';
import { translationConfig } from '../../../config/translation/config';
import { ElasticSearchService } from '../../../services/elastic-search/service/elastic-search.service';
import { TranslateService } from '../../../services/translate/service/translate.service';
import { getTransformedItems, stringToBool, transformGclItems } from '../../../utils/helpers';
import { BulkCreateItemDumpDto, CreateItemDumpDto } from '../../dump/dto/create-item-dump.dto';
import { ItemDumpService } from '../../dump/service/item-dump.service';
import { OrderDumpService } from '../../dump/service/order-dump.service';
import { KafkaConsumerService } from '../../kafka/consumer/consumer.service';
import { PaginationRequestQuery } from '../dto/pagination-request.dto';
import { RawCatalogueData } from '../schema/catalogue.items.interface';
import { TranslationResponse } from '../schema/translation.response.interface';
import { getSuccessResponse } from '../../../utils/success-response.util';
import { HttpResponseMessage } from '../../../common/constants/error-message';
import { IUserInfo } from '../../../common/interfaces/user-info';
import { PaymentGatewayService } from 'src/modules/payment-gateway/payment-gateway.service';
import { DsepCoursesSearchResponse } from '../schema/gcl-catalogue.items.interface';
import { RateRequestDto } from '../dto/rate-request.dto';
import { CancelRequestDto } from '../dto/cancel-request.dto';
import { UpdateRequestDto } from '../dto/update-request.dto';
import { SupportRequestDto } from '../dto/support-request.dto';
import { TrackRequestDto } from '../dto/track-request.dto';
import { ActionMessage } from 'src/common/constants/stg-constants';
import { GclSearchRequestDto } from '../dto/gcl-search-request.dto';

@Injectable()
export class StgService {
  private deviceIdMapper: Map<string, any> = new Map();
  private serverDefaultLanguage: string;
  private readonly elasticsearchService: ElasticSearchService;
  private userTransactions: Map<string, any>;
  private readonly logger = new Logger(StgService.name);
  constructor(
    private readonly httpService: AxiosService,
    private readonly getUrl: GetUrl,
    private readonly configService: ConfigService,
    private readonly itemDumpService: ItemDumpService,
    private readonly payloadService: RequestPayloadUtilsService,
    // private readonly elasticsearchService: ElasticSearchService,
    private readonly translationService: TranslateService,
    private readonly kafkaService: KafkaConsumerService,
    private readonly paymentService: PaymentGatewayService,
    private readonly sendPayloadService: ResponsePayloadUtilsService,
    private readonly orderService: OrderDumpService,
  ) {
    this.deviceIdMapper = new Map();
    this.serverDefaultLanguage = this.configService.get('serverDefaultLanguage');
    this.userTransactions = new Map();
  }

  // Sets CRON Job at 4:00 AM
  @Cron('00 04 * * *')
  async handleCustomCron() {
    this.logger.log('Called at 4:00 AM every day');
    this.logger.log(process.env.DOMAINS.includes(' '));
    const domains = process.env.DOMAINS.includes(' ') ? process.env.DOMAINS.split(' ') : [process.env.DOMAINS];
    this.logger.log('Domain::: ', domains);
    while (domains.length > 0) {
      const searchRequest: GclSearchRequestDto = {
        query: '',
        transaction_id: uuidV4(),
        domain: domains[domains.length - 1],
      };
      const gclSearchSResponse = await this.gclSearch(searchRequest);
      this.logger.log('gclSearchSResponse::: ', gclSearchSResponse);
      domains.pop();
    }

    this.logger.log(this.deviceIdMapper);
  }
  async search(pagination: PaginationRequestQuery, searchRequestDto: SearchRequestDto, userId: string) {
    try {
      // Query the elastic search to find item ids by search query
      // const esResults = await this.elasticsearchService.search(
      //   searchRequestDto.searchQuery,
      //   searchRequestDto.page,
      //   searchRequestDto.pageSize,
      // );
      // const itemIds = esResults.map((item: Item) => item.id);
      // Fetch the language preference of the device using deviceId
      const userDevicePreference = await this.httpService.get(
        `${this.getUrl.getDevicePreferenceUrl}/${searchRequestDto.deviceId}`,
      );
      const languageCode = userDevicePreference.data?.languageCode ?? Languages.ENGLISH;
      this.logger.log('languageCode', languageCode);
      const domains = userDevicePreference.data?.domainData || [];
      const getItems = await this.itemDumpService.findPaginatedItems(
        [],
        [],
        'en',
        pagination.page,
        pagination.pageSize,
        searchRequestDto.searchQuery,
        domains,
        userId,
      );

      const itemIds = (getItems['items'] as []).map((item) => item['item_id']);
      const providerIds = (getItems['items'] as []).map((item) => item['provider_id']);

      this.logger.log('itemIds', itemIds);
      this.logger.log('providerIds', providerIds);

      const translatedItems = await this.itemDumpService.findPaginatedItems(
        itemIds,
        providerIds,
        languageCode,
        pagination.page,
        pagination.pageSize,
        searchRequestDto.searchQuery,
        domains,
        userId,
      );
      return translatedItems;
    } catch (error) {
      throw error;
    }
  }

  private async receiveCatalogData(data: RawCatalogueData[]) {
    try {
      let resultData = [];
      let newItems = [];
      await Promise.allSettled(
        data.map(async (dataElement) => {
          const transformedItems = getTransformedItems(dataElement);
          resultData = [...transformedItems];
          const dumpedData = await this.itemDumpService.bulkWrite(
            {
              items: transformedItems.map(
                (item) =>
                  new CreateItemDumpDto({
                    transaction_id: item?.transaction_id,
                    item_id: item?.item_id,
                    domain: item.domain,
                    descriptor: {
                      name: item?.descriptor?.name,
                      long_desc: item?.descriptor?.long_desc,
                      short_desc: item?.descriptor?.short_desc,
                      images: item?.descriptor?.images?.map((image) => image?.url) ?? [],
                    },
                    price: item?.price,
                    provider_id: item?.provider_id,
                    provider: {
                      name: item?.provider?.name,
                      long_desc: item?.provider?.long_desc,
                      short_desc: item?.provider?.short_desc,
                      images: item?.provider?.images?.map((image) => image?.url) ?? [],
                    },
                    rating: item?.rating,
                    rateable: item?.rateable,
                    creator: {
                      name: item?.creator?.name,
                      long_desc: item?.creator?.long_desc,
                      short_desc: item?.creator?.short_desc,
                      images: item?.creator?.images?.map((image) => image?.url) ?? [],
                    },
                    bpp_id: item?.bpp_id,
                    bpp_uri: item?.bpp_uri,
                    // tags: item.tags,
                    tags: [],
                  }),
              ),
            },
            Languages.ENGLISH,
          );
          // Extract upsertedIds and insertedIds
          newItems = [...newItems, ...Object.values(dumpedData.upsertedIds)];
          //get upsertedIds for new documents and
          return transformedItems;
        }),
      );
      const filters = { provider_id: { $ne: 142 } };
      const limit = 5;
      let skip = 0;
      let hasMoreItems = true;

      while (hasMoreItems) {
        const items = await this.itemDumpService.findAll(filters, skip, limit);
        if (items.length > 0) {
          if (translationConfig.useAsync) {
            // await this.kafkaService.initializeConsumer(KafkaTopics.translation);
          }

          try {
            const languagesToTranslate = translationConfig.supportedLanguages.slice(1);
            for (const language of languagesToTranslate) {
              const translatedItemsTags = [];
              items.map(async (item) => {
                const itemTags =
                  item['tags']?.[0]?.list?.map((listItem) => {
                    return {
                      item_id: item['item_id'],
                      tag_name: item['tags']?.[0]?.descriptor.name ?? '',
                      tag_code: item['tags']?.[0]?.descriptor.code ?? '',
                      name: listItem?.descriptor?.name ?? '',
                      code: listItem?.descriptor?.code ?? '',
                      value: listItem?.value ?? '',
                      tag_display: item['tags']?.[0].display ?? '',
                    };
                  }) ?? [];
                this.logger.log('itemTags', itemTags);
                const translatedSingleItemTags =
                  itemTags.length > 0
                    ? await this.translationService.translateData({
                        sourceLanguage: translationConfig.defaultLanguage,
                        targetLanguage: language,
                        content: itemTags,
                        excluded_keys: translationConfig.catalogConfig.keysToExclude,
                        useAsync: translationConfig.useAsync,
                      })
                    : {
                        translated_text: [],
                      };
                translatedItemsTags.push(translatedSingleItemTags.translated_text);
              });
              const translatedResponse: TranslationResponse = await this.translationService.translateData({
                sourceLanguage: translationConfig.defaultLanguage,
                targetLanguage: language,
                content: items.map((item) => {
                  const itemData = {
                    item_domain: item['domain'],
                    item_transaction_id: item['transaction_id'],
                    item_id: item['item_id'] ?? '',
                    item_name: item['descriptor']['name'] ?? '',
                    item_short_desc: item['descriptor']['short_desc'] ?? '',
                    item_long_desc: item['descriptor']['long_desc'] ?? '',
                    item_images:
                      item['descriptor']['images']?.length > 0 ? JSON.stringify(item['descriptor']['images']) : '',
                    item_media:
                      item['descriptor']['media']?.length > 0 ? JSON.stringify(item['descriptor']['media']) : '',
                    item_price_value: item['price']['value'] ?? '',
                    item_price_currency: item['price']['currency'] ?? '',
                    provider_id: item['provider_id'] ?? '',
                    provider_name: item['provider']['name'] ?? '',
                    provider_short_desc: item['provider']['short_desc'] ?? '',
                    provider_long_desc: item['provider']['long_desc'] ?? '',
                    provider_images:
                      item['provider']['images'].length > 0 ? JSON.stringify(item['provider']['images']) : '',
                    creator_name: item['creator']['name'] ?? '',
                    creator_short_desc: item['creator']['short_desc'] ?? '',
                    creator_long_desc: item['creator']['long_desc'] ?? '',
                    creator_images:
                      item['creator']['images'].length > 0 ? JSON.stringify(item['creator']['images']) : '',
                    item_rating: item.rating ?? '0',
                    item_rateable: stringToBool(item.rateable) || false,
                  };
                  return itemData;
                }),
                excluded_keys: translationConfig.catalogConfig.keysToExclude,
                useAsync: translationConfig.useAsync,
              });
              const translatedFinalResponse = {
                target_language: translatedResponse.target_language,
                translated_text: {
                  items: (translatedResponse.translated_text as []).map((item) => {
                    const tags =
                      translatedItemsTags.find((itemTagList) =>
                        itemTagList.length > 0 ? itemTagList[0]['item_id'] === item['item_id'] : false,
                      ) ?? [];
                    const itemData = {
                      domain: item['item_domain'],
                      item_id: item['item_id'],
                      transaction_id: item['item_transaction_id'],
                      descriptor: {
                        name: item['item_name'],
                        short_desc: item['item_short_desc'],
                        long_desc: item['item_long_desc'],
                        images: item['item_images'] === '' ? [] : JSON.parse(item['item_images']),
                        media: item['item_media'] === '' ? [] : JSON.parse(item['item_media']),
                      },
                      price: {
                        value: item['item_price_value'],
                        currency: item['item_price_currency'],
                      },
                      provider_id: item['provider_id'],
                      provider: {
                        name: item['provider_name'],
                        short_desc: item['provider_short_desc'],
                        long_desc: item['provider_long_desc'],
                        images: item['provider_images'] === '' ? [] : JSON.parse(item['provider_images']),
                      },
                      creator: {
                        name: item['creator_name'],
                        short_desc: item['creator_short_desc'],
                        long_desc: item['creator_long_desc'],
                        images: item['creator_images'] === '' ? [] : JSON.parse(item['creator_images']),
                      },
                      rating: item['item_rating'] ?? '0',
                      rateable: stringToBool(item['item_rateable']) ?? true,
                      tags:
                        tags.length > 0
                          ? [
                              {
                                descriptor: {
                                  code: tags.at(0)['tag_code'],
                                  name: tags.at(0)['tag_name'],
                                },
                                list:
                                  tags.map((tag) => {
                                    return {
                                      descriptor: {
                                        code: tag['code'],
                                        name: tag['name'],
                                      },
                                      value: tag['value'],
                                    };
                                  }) ?? [],
                                display: stringToBool(tags.at(0)['tag_display']),
                              },
                            ]
                          : [],
                    };
                    return itemData;
                  }),
                },
              };
              if (!translationConfig.useAsync) {
                // Using the translatedResponse from the api, dump the response into the appropriate language dumps
                await this.dumpTranslatedItems(translatedFinalResponse);
              } else {
                // This condition is for the kafka listener and response will be sent async in kafka
                await this.subscribeToTranslationKafka();
              }
            }

            // await this.translateItem(items);
          } catch (error) {
            throw error;
          }

          // Check if there are more items to fetch
          hasMoreItems = items.length === limit;
          skip += limit;
        }
      }

      return {
        success: true,
        message: 'Items fetched & translated successfully.',
        data: resultData,
      };
    } catch (error) {
      throw error;
    }
  }

  private async receiveCatalogDataFromGCL(data: DsepCoursesSearchResponse[]) {
    try {
      let resultData = [];
      let newItems = [];
      this.logger.log('dsepData', data);
      await Promise.allSettled(
        data.map(async (dataElement) => {
          const transformedItems = transformGclItems(dataElement);
          resultData = [...transformedItems];
          this.logger.log('resultData', resultData);
          const dumpedData = await this.itemDumpService.bulkWrite(
            {
              items: transformedItems.map(
                (item) =>
                  new CreateItemDumpDto({
                    transaction_id: item?.transaction_id,
                    item_id: item?.item_id,
                    domain: item.domain,
                    descriptor: {
                      name: item?.descriptor?.name,
                      long_desc: item?.descriptor?.long_desc,
                      short_desc: item?.descriptor?.short_desc,
                      images: item?.descriptor?.images?.map((image) => image?.url) ?? [],
                    },
                    price: item?.price,
                    provider_id: item?.provider_id,
                    provider: {
                      name: item?.provider?.name,
                      long_desc: item?.provider?.long_desc,
                      short_desc: item?.provider?.short_desc,
                      images: item?.provider?.images?.map((image) => image?.url) ?? [],
                    },
                    rating: item?.rating,
                    rateable: item?.rateable,
                    creator: {
                      name: item?.creator?.name,
                      long_desc: item?.creator?.long_desc,
                      short_desc: item?.creator?.short_desc,
                      images: item?.creator?.images?.map((image) => image?.url) ?? [],
                    },
                    bpp_id: item?.bpp_id,
                    bpp_uri: item?.bpp_uri,
                    tags: item.tags,
                  }),
              ),
            },
            Languages.ENGLISH,
          );
          // Extract upsertedIds and insertedIds
          newItems = [...newItems, ...Object.values(dumpedData.upsertedIds)];
          //get upsertedIds for new documents and
          return transformedItems;
        }),
      );
      const filters = { provider_id: { $ne: 142 } };
      const limit = 5;
      let skip = 0;
      let hasMoreItems = true;

      while (hasMoreItems) {
        const items = await this.itemDumpService.findAll(filters, skip, limit);
        if (items.length > 0) {
          if (translationConfig.useAsync) {
            // await this.kafkaService.initializeConsumer(KafkaTopics.translation);
          }

          try {
            const languagesToTranslate = translationConfig.supportedLanguages.slice(1);
            for (const language of languagesToTranslate) {
              const translatedItemsTags = [];
              items.map(async (item) => {
                const itemTags =
                  item['tags']?.[0]?.list?.map((listItem) => {
                    return {
                      item_id: item['item_id'],
                      tag_name: item['tags']?.[0]?.descriptor.name ?? '',
                      tag_code: item['tags']?.[0]?.descriptor.code ?? '',
                      name: listItem?.descriptor?.name ?? '',
                      code: listItem?.descriptor?.code ?? '',
                      value: listItem?.value ?? '',
                      tag_display: item['tags']?.[0].display ?? '',
                    };
                  }) ?? [];
                this.logger.log('itemTags', itemTags);
                const translatedSingleItemTags =
                  itemTags.length > 0
                    ? await this.translationService.translateData({
                        sourceLanguage: translationConfig.defaultLanguage,
                        targetLanguage: language,
                        content: itemTags,
                        excluded_keys: translationConfig.catalogConfig.keysToExclude,
                        useAsync: translationConfig.useAsync,
                      })
                    : {
                        translated_text: [],
                      };
                translatedItemsTags.push(translatedSingleItemTags.translated_text);
              });
              const translatedResponse: TranslationResponse = await this.translationService.translateData({
                sourceLanguage: translationConfig.defaultLanguage,
                targetLanguage: language,
                content: items.map((item) => {
                  const itemData = {
                    item_domain: item['domain'],
                    item_transaction_id: item['transaction_id'],
                    item_id: item['item_id'] ?? '',
                    item_name: item['descriptor']['name'] ?? '',
                    item_short_desc: item['descriptor']['short_desc'] ?? '',
                    item_long_desc: item['descriptor']['long_desc'] ?? '',
                    item_images:
                      item['descriptor']['images']?.length > 0 ? JSON.stringify(item['descriptor']['images']) : '',
                    item_media:
                      item['descriptor']['media']?.length > 0 ? JSON.stringify(item['descriptor']['media']) : '',
                    item_price_value: item['price']['value'] ?? '',
                    item_price_currency: item['price']['currency'] ?? '',
                    provider_id: item['provider_id'] ?? '',
                    provider_name: item['provider']['name'] ?? '',
                    provider_short_desc: item['provider']['short_desc'] ?? '',
                    provider_long_desc: item['provider']['long_desc'] ?? '',
                    provider_images:
                      item['provider']['images'].length > 0 ? JSON.stringify(item['provider']['images']) : '',
                    creator_name: item['creator']['name'] ?? '',
                    creator_short_desc: item['creator']['short_desc'] ?? '',
                    creator_long_desc: item['creator']['long_desc'] ?? '',
                    creator_images:
                      item['creator']['images'].length > 0 ? JSON.stringify(item['creator']['images']) : '',
                    item_rating: item.rating ?? '0',
                    item_rateable: stringToBool(item.rateable) || false,
                  };
                  return itemData;
                }),
                excluded_keys: translationConfig.catalogConfig.keysToExclude,
                useAsync: translationConfig.useAsync,
              });
              const translatedFinalResponse = {
                target_language: translatedResponse.target_language,
                translated_text: {
                  items: (translatedResponse.translated_text as []).map((item) => {
                    const tags =
                      translatedItemsTags.find((itemTagList) =>
                        itemTagList.length > 0 ? itemTagList[0]['item_id'] === item['item_id'] : false,
                      ) ?? [];
                    const itemData = {
                      domain: item['item_domain'],
                      item_id: item['item_id'],
                      transaction_id: item['item_transaction_id'],
                      descriptor: {
                        name: item['item_name'],
                        short_desc: item['item_short_desc'],
                        long_desc: item['item_long_desc'],
                        images: item['item_images'] === '' ? [] : JSON.parse(item['item_images']),
                        media: item['item_media'] === '' ? [] : JSON.parse(item['item_media']),
                      },
                      price: {
                        value: item['item_price_value'],
                        currency: item['item_price_currency'],
                      },
                      provider_id: item['provider_id'],
                      provider: {
                        name: item['provider_name'],
                        short_desc: item['provider_short_desc'],
                        long_desc: item['provider_long_desc'],
                        images: item['provider_images'] === '' ? [] : JSON.parse(item['provider_images']),
                      },
                      creator: {
                        name: item['creator_name'],
                        short_desc: item['creator_short_desc'],
                        long_desc: item['creator_long_desc'],
                        images: item['creator_images'] === '' ? [] : JSON.parse(item['creator_images']),
                      },
                      rating: item['item_rating'] ?? '0',
                      rateable: stringToBool(item['item_rateable']) ?? true,
                      tags:
                        tags.length > 0
                          ? [
                              {
                                descriptor: {
                                  code: tags.at(0)['tag_code'],
                                  name: tags.at(0)['tag_name'],
                                },
                                list:
                                  tags.map((tag) => {
                                    return {
                                      descriptor: {
                                        code: tag['code'],
                                        name: tag['name'],
                                      },
                                      value: tag['value'],
                                    };
                                  }) ?? [],
                                display: stringToBool(tags.at(0)['tag_display']),
                              },
                            ]
                          : [],
                    };
                    return itemData;
                  }),
                },
              };
              if (!translationConfig.useAsync) {
                // Using the translatedResponse from the api, dump the response into the appropriate language dumps
                await this.dumpTranslatedItems(translatedFinalResponse);
              } else {
                // This condition is for the kafka listener and response will be sent async in kafka
                await this.subscribeToTranslationKafka();
              }
            }

            // await this.translateItem(items);
          } catch (error) {
            throw error;
          }

          // Check if there are more items to fetch
          hasMoreItems = items.length === limit;
          skip += limit;
        }
      }

      return {
        success: true,
        message: 'Items fetched & translated successfully.',
        data: resultData,
      };
    } catch (error) {
      throw error;
    }
  }

  public async translateItem(items) {
    try {
      const languagesToTranslate = translationConfig.supportedLanguages.slice(1);
      for (const language of languagesToTranslate) {
        const translatedItemsTags = [];
        items.map(async (item) => {
          const itemTags =
            item['tags']?.[0]?.list?.map((listItem) => {
              return {
                item_id: item['item_id'],
                tag_name: item['tags']?.[0]?.descriptor.name ?? '',
                tag_code: item['tags']?.[0]?.descriptor.code ?? '',
                name: listItem?.descriptor?.name ?? '',
                code: listItem?.descriptor?.code ?? '',
                value: listItem?.value ?? '',
                tag_display: item['tags']?.[0].display ?? '',
              };
            }) ?? [];
          this.logger.log('itemTags', itemTags);
          const translatedSingleItemTags =
            itemTags.length > 0
              ? await this.translationService.translateData({
                  sourceLanguage: translationConfig.defaultLanguage,
                  targetLanguage: language,
                  content: itemTags,
                  excluded_keys: translationConfig.catalogConfig.keysToExclude,
                  useAsync: translationConfig.useAsync,
                })
              : {
                  translated_text: [],
                };
          translatedItemsTags.push(translatedSingleItemTags.translated_text);
        });
        const translatedResponse: TranslationResponse = await this.translationService.translateData({
          sourceLanguage: translationConfig.defaultLanguage,
          targetLanguage: language,
          content: items.map((item) => {
            const itemData = {
              item_domain: item['domain'],
              item_transaction_id: item['transaction_id'],
              item_id: item['item_id'] ?? '',
              item_name: item['descriptor']['name'] ?? '',
              item_short_desc: item['descriptor']['short_desc'] ?? '',
              item_long_desc: item['descriptor']['long_desc'] ?? '',
              item_images: item['descriptor']['images']?.length > 0 ? JSON.stringify(item['descriptor']['images']) : '',
              item_media: item['descriptor']['media']?.length > 0 ? JSON.stringify(item['descriptor']['media']) : '',
              item_price_value: item['price']['value'] ?? '',
              item_price_currency: item['price']['currency'] ?? '',
              provider_id: item['provider_id'] ?? '',
              provider_name: item['provider']['name'] ?? '',
              provider_short_desc: item['provider']['short_desc'] ?? '',
              provider_long_desc: item['provider']['long_desc'] ?? '',
              provider_images: item['provider']['images'].length > 0 ? JSON.stringify(item['provider']['images']) : '',
              creator_name: item['creator']['name'] ?? '',
              creator_short_desc: item['creator']['short_desc'] ?? '',
              creator_long_desc: item['creator']['long_desc'] ?? '',
              creator_images: item['creator']['images'].length > 0 ? JSON.stringify(item['creator']['images']) : '',
            };
            return itemData;
          }),
          excluded_keys: translationConfig.catalogConfig.keysToExclude,
          useAsync: translationConfig.useAsync,
        });
        const translatedFinalResponse = {
          target_language: translatedResponse.target_language,
          translated_text: {
            items: (translatedResponse.translated_text as []).map((item) => {
              const tags =
                translatedItemsTags.find((itemTagList) =>
                  itemTagList.length > 0 ? itemTagList[0]['item_id'] === item['item_id'] : false,
                ) ?? [];
              const itemData = {
                domain: item['item_domain'],
                item_id: item['item_id'],
                transaction_id: item['item_transaction_id'],
                descriptor: {
                  name: item['item_name'],
                  short_desc: item['item_short_desc'],
                  long_desc: item['item_long_desc'],
                  images: item['item_images'] === '' ? [] : JSON.parse(item['item_images']),
                  media: item['item_media'] === '' ? [] : JSON.parse(item['item_media']),
                },
                price: {
                  value: item['item_price_value'],
                  currency: item['item_price_currency'],
                },
                provider_id: item['provider_id'],
                provider: {
                  name: item['provider_name'],
                  short_desc: item['provider_short_desc'],
                  long_desc: item['provider_long_desc'],
                  images: item['provider_images'] === '' ? [] : JSON.parse(item['provider_images']),
                },
                creator: {
                  name: item['creator_name'],
                  short_desc: item['creator_short_desc'],
                  long_desc: item['creator_long_desc'],
                  images: item['creator_images'] === '' ? [] : JSON.parse(item['creator_images']),
                },
                tags:
                  tags.length > 0
                    ? [
                        {
                          descriptor: {
                            code: tags.at(0)['tag_code'],
                            name: tags.at(0)['tag_name'],
                          },
                          list:
                            tags.map((tag) => {
                              return {
                                descriptor: {
                                  code: tag['code'],
                                  name: tag['name'],
                                },
                                value: tag['value'],
                              };
                            }) ?? [],
                          display: stringToBool(tags.at(0)['tag_display']),
                        },
                      ]
                    : [],
              };
              return itemData;
            }),
          },
        };
        if (!translationConfig.useAsync) {
          // Using the translatedResponse from the api, dump the response into the appropriate language dumps
          await this.dumpTranslatedItems(translatedFinalResponse);
        } else {
          // This condition is for the kafka listener and response will be sent async in kafka
          await this.subscribeToTranslationKafka();
        }
      }
    } catch (error) {
      throw error;
    }
  }

  private async receiveTranslationMessage(message: TranslationResponse) {
    try {
      await this.dumpTranslatedItems(message);
    } catch (error) {
      throw error?.response?.data;
    }
  }

  private async dumpTranslatedItems(message: TranslationResponse) {
    try {
      const items = message.translated_text as BulkCreateItemDumpDto;
      await this.itemDumpService.bulkWrite(items, message.target_language);
    } catch (error) {
      throw error;
    }
  }

  async subscribeToTranslationKafka() {
    // await this.kafkaService.initializeConsumer(KafkaTopics.translation);
    const requestProducer = await this.httpService.get(this.getUrl.subscribeToKafkaCatalogue);
    return requestProducer.data;
  }

  async subscribeToCatalogKafka() {
    // await this.kafkaService.initializeConsumer(KafkaTopics.catalog);
    const requestProducer = await this.httpService.get(this.getUrl.subscribeToKafkaCatalogue);
    return requestProducer.data;
  }

  async fetchSearchDataFromGCL(data: any) {
    try {
      this.logger.log('fetchSearchDataFromGCL');
      const getItemsData = data?.data;
      this.logger.debug('getItemsData', getItemsData);
      if (getItemsData?.length > 0) {
        await this.receiveCatalogDataFromGCL(getItemsData);
      }

      return {
        success: true,
        message: 'Items fetched & translated successfully.',
        data: null,
      };
    } catch (error) {
      throw error;
    }
  }
  async fetchSearchData() {
    try {
      this.logger.log('fetchSearchData');
      const limit = 5;
      let skip = 0;
      let hasMoreItems = true;
      while (hasMoreItems) {
        const getItemsData = await this.httpService.get(this.getUrl.getSearchItems, {
          pageSize: limit,
          pageNumber: skip,
        });
        this.logger.log('getItemsData', getItemsData);
        if (getItemsData.length > 0) {
          getItemsData?.map(async (item) => {
            await this.fetchSearchDataFromGCL(item);
          });
        }

        hasMoreItems = getItemsData.length === limit;
        skip += limit;
      }

      return {
        success: true,
        message: 'Items fetched & translated successfully.',
        data: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async gclSearch(gclSearchRequestDto: GclSearchRequestDto) {
    try {
      this.logger.debug('gclSearchRequestDto====>', gclSearchRequestDto);

      const searchPayload = this.payloadService.createGclSearchPayload(gclSearchRequestDto);
      this.logger.log(this.getUrl.getGclSelectUrl, searchPayload);
      const searchResponse = await this.httpService.post(this.getUrl.getGclSearchUrl, searchPayload);
      return getSuccessResponse(ActionMessage.Search, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.log('error?.response?.data?.error?.message', error?.response?.data?.error?.message);
      if (error?.response?.data?.error?.message == '' || error?.response?.data?.error?.message == undefined) {
        return getSuccessResponse(ActionMessage.Search, HttpResponseMessage.OK);
      }

      throw error?.response?.data;
    }
  }
  async select(token: string, selectRequestDto: SelectRequestDto) {
    try {
      this.logger.debug('selectRequestDto====', selectRequestDto);
      const itemDetails = await this.itemDumpService.findByItemId(
        { item_id: selectRequestDto.item_id },
        Languages.ENGLISH,
      );
      this.logger.log(itemDetails);
      const selectPayload = this.payloadService.createSelectPayload(selectRequestDto, itemDetails);
      this.logger.log(this.getUrl.getGclSelectUrl, selectPayload);
      const selectResponse = await this.httpService.post(this.getUrl.getGclSelectUrl, selectPayload, {
        Authorization: token,
      });
      this.logger.log('selectResponse: ', selectResponse);
      return getSuccessResponse(ActionMessage.Select, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.log('error?.response?.data?.error?.message', error?.response?.data?.error?.message);
      if (error?.response?.data?.error?.message == '' || error?.response?.data?.error?.message == undefined) {
        return getSuccessResponse(ActionMessage.Select, HttpResponseMessage.OK);
      }

      throw error?.response?.data;
    }
  }
  async init(token: string, initRequestDto: InitRequestDto) {
    try {
      this.logger.debug('initRequestDto====', initRequestDto);
      const user: IUserInfo = (
        await this.httpService.get(this.getUrl.getUserProfileUrl, { translate: false }, { Authorization: token })
      )?.data;
      const itemDetails = await this.itemDumpService.findByItemId(
        { item_id: initRequestDto.item_id },
        Languages.ENGLISH,
      );
      const initPayload = this.payloadService.createInitPayload(initRequestDto, user, itemDetails);
      this.logger.log('payload and Url', {
        url: this.getUrl.getGclInitUrl,
        initPayload: initPayload,
      });
      const intiResponse = await this.httpService.post(this.getUrl.getGclInitUrl, initPayload, {
        Authorization: token,
      });
      return getSuccessResponse(intiResponse, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.log('Init :::: error?.response?.data?.error?.message', error?.response?.data?.error?.message);
      if (error?.response?.data?.error?.message == '' || error?.response?.data?.error?.message == undefined) {
        return getSuccessResponse(ActionMessage.Init, HttpResponseMessage.OK);
      }

      throw error?.response?.data;
    }
  }

  async confirm(token: string, confirmRequestDto: ConfirmRequestDto) {
    this.logger.log('token', token);
    try {
      this.logger.debug('confirmRequestDto====', confirmRequestDto);
      const user: IUserInfo = (
        await this.httpService.get(this.getUrl.getUserProfileUrl, { translate: false }, { Authorization: token })
      )?.data;
      const itemDetails = await this.itemDumpService.findByItemId(
        { item_id: confirmRequestDto.item_id },
        Languages.ENGLISH,
      );
      const userId = user._id;
      this.logger.log('userId', userId);
      const confirmPayload = this.payloadService.createConfirmPayload(confirmRequestDto, user, itemDetails);
      this.userTransactions.set(confirmRequestDto.transaction_id, userId);
      const confirmResponse = await this.httpService.post(this.getUrl.getGclConfirmUrl, confirmPayload, {
        Authorization: token,
      });
      this.logger.log('confirmResponse: ', confirmResponse);
      return getSuccessResponse(ActionMessage.Confirm, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.log('Confirm :::: error?.response?.data?.error?.message', error?.response?.data?.error?.message);
      if (error?.response?.data?.error?.message == '' || error?.response?.data?.error?.message == undefined) {
        return getSuccessResponse(ActionMessage.Confirm, HttpResponseMessage.OK);
      }

      throw error?.response?.data;
    }
  }

  async status(token: string, statusRequestDto: StatusRequestDto) {
    try {
      this.logger.debug('statusRequestDto', statusRequestDto);
      const user = (
        await this.httpService.get(this.getUrl.getUserProfileUrl, { translate: false }, { Authorization: token })
      )?.data;
      const itemDetails = await this.itemDumpService.findByItemId(
        { item_id: statusRequestDto.item_id },
        Languages.ENGLISH,
      );
      const userId = user._id;
      const statusPayload = this.payloadService.createStatusPayload(statusRequestDto, itemDetails);

      const order = await this.orderService.fetchOrderDetails(
        userId,
        statusRequestDto.transaction_id,
        statusRequestDto.item_id,
        statusRequestDto.order_id,
      );
      this.logger.log('order', order);

      this.logger.log('userId', userId);
      this.userTransactions.set(statusRequestDto.item_id, [userId, statusRequestDto.order_id]);

      const statusResponse = await this.httpService.post(this.getUrl.getGclStatusUrl, statusPayload, {
        Authorization: token,
      });
      this.logger.log('statusResponse: ', statusResponse);
      return getSuccessResponse(ActionMessage.Status, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.log('Status :::: error?.response?.data?.error?.message', error?.response?.data?.error?.message);
      if (error?.response?.data?.error?.message == '' || error?.response?.data?.error?.message == undefined) {
        return getSuccessResponse(ActionMessage.Status, HttpResponseMessage.OK);
      }

      throw error?.response?.data;
    }
  }

  async rate(token: string, rateRequestDto: RateRequestDto) {
    try {
      this.logger.debug('rateRequestDto====', rateRequestDto);
      const user: IUserInfo = (
        await this.httpService.get(this.getUrl.getUserProfileUrl, { translate: false }, { Authorization: token })
      )?.data;
      const itemDetails = await this.itemDumpService.findByItemId(
        { item_id: rateRequestDto.item_id },
        Languages.ENGLISH,
      );
      const ratePayload = this.payloadService.createRatingPayload(
        rateRequestDto.value,
        rateRequestDto.rating_category,
        rateRequestDto.order_id,
        rateRequestDto.domain,
        itemDetails,
      );
      this.logger.log('payload and Url', {
        url: this.getUrl.getGclInitUrl,
        ratePayload: ratePayload,
      });
      const rateResponse = await this.httpService.post(this.getUrl.getGclRateUrl, ratePayload, {
        Authorization: token,
      });
      this.logger.log('Rate Response: ', rateResponse);
      return getSuccessResponse(rateResponse?.data ? rateResponse?.data : ActionMessage.Rate, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.log('Rate :::: error?.response?.data?.error?.message', error?.response?.data?.error?.message);
      if (error?.response?.data?.error?.message == '' || error?.response?.data?.error?.message == undefined) {
        return getSuccessResponse(ActionMessage.Rate, HttpResponseMessage.OK);
      }

      throw error?.response?.data;
    }
  }

  async cancel(token: string, cancelRequestDto: CancelRequestDto) {
    try {
      this.logger.debug('cancelRequestDto====', cancelRequestDto);
      const user: IUserInfo = (
        await this.httpService.get(this.getUrl.getUserProfileUrl, { translate: false }, { Authorization: token })
      )?.data;
      const itemDetails = await this.itemDumpService.findByItemId(
        { item_id: cancelRequestDto.item_id },
        Languages.ENGLISH,
      );
      const cancelPayload = this.payloadService.createCancelPayload(
        cancelRequestDto.transaction_id,
        cancelRequestDto.cancellation_reason_id,
        cancelRequestDto.order_id,
        cancelRequestDto.domain,
        itemDetails,
      );
      this.logger.log('payload and Url', {
        url: this.getUrl.getGclCancelUrl,
        cancelPayload: cancelPayload,
      });
      const cancelResponse = await this.httpService.post(this.getUrl.getGclCancelUrl, cancelPayload, {
        Authorization: token,
      });
      this.logger.log('cancel Response: ', cancelResponse);
      return getSuccessResponse(ActionMessage.Cancel, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.log('Cancel :::: error?.response?.data?.error?.message', error?.response?.data?.error?.message);
      if (error?.response?.data?.error?.message == '' || error?.response?.data?.error?.message == undefined) {
        return getSuccessResponse(ActionMessage.Cancel, HttpResponseMessage.OK);
      }

      throw error?.response?.data;
    }
  }

  async update(token: string, updateRequestDto: UpdateRequestDto) {
    try {
      this.logger.debug('updateRequestDto====', updateRequestDto);
      const user: IUserInfo = (
        await this.httpService.get(this.getUrl.getUserProfileUrl, { translate: false }, { Authorization: token })
      )?.data;
      const itemDetails = await this.itemDumpService.findByItemId(
        { item_id: updateRequestDto.item_id },
        Languages.ENGLISH,
      );
      const updatePayload = this.payloadService.createUpdatePayload(
        updateRequestDto.transaction_id,
        updateRequestDto.name,
        updateRequestDto.order_id,
        updateRequestDto.domain,
        itemDetails,
      );
      this.logger.log('payload and Url', {
        url: this.getUrl.getGclUpdateUrl,
        updatePayload: updatePayload,
      });
      const updateResponse = await this.httpService.post(this.getUrl.getGclUpdateUrl, updatePayload, {
        Authorization: token,
      });
      this.logger.log('update Response: ', updateResponse);
      return getSuccessResponse(ActionMessage.Update, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.log('Update :::: error?.response?.data?.error?.message', error?.response?.data?.error?.message);
      if (error?.response?.data?.error?.message == '' || error?.response?.data?.error?.message == undefined) {
        return getSuccessResponse(ActionMessage.Update, HttpResponseMessage.OK);
      }

      throw error?.response?.data;
    }
  }

  async support(token: string, supportRequestDto: SupportRequestDto) {
    try {
      this.logger.debug('supportRequestDto====', supportRequestDto);
      const user: IUserInfo = (
        await this.httpService.get(this.getUrl.getUserProfileUrl, { translate: false }, { Authorization: token })
      )?.data;
      const itemDetails = await this.itemDumpService.findByItemId(
        { item_id: supportRequestDto.item_id },
        Languages.ENGLISH,
      );
      const supportPayload = this.payloadService.createSupportPayload(
        supportRequestDto.transaction_id,
        supportRequestDto.ref_id,
        supportRequestDto.order_id,
        supportRequestDto.domain,
        itemDetails,
      );
      this.logger.log('payload and Url', {
        url: this.getUrl.getGclSupportUrl,
        supportPayload: supportPayload,
      });
      const supportResponse = await this.httpService.post(this.getUrl.getGclSupportUrl, supportPayload, {
        Authorization: token,
      });
      this.logger.log('support Response: ', supportResponse);
      return getSuccessResponse(ActionMessage.Support, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.log('Support :::: error?.response?.data?.error?.message', error?.response?.data?.error?.message);
      if (error?.response?.data?.error?.message == '' || error?.response?.data?.error?.message == undefined) {
        return getSuccessResponse(ActionMessage.Support, HttpResponseMessage.OK);
      }

      throw error?.response?.data;
    }
  }

  async track(token: string, trackRequestDto: TrackRequestDto) {
    try {
      this.logger.debug('trackRequestDto====', trackRequestDto);
      const user: IUserInfo = (
        await this.httpService.get(this.getUrl.getUserProfileUrl, { translate: false }, { Authorization: token })
      )?.data;
      const itemDetails = await this.itemDumpService.findByItemId(
        { item_id: trackRequestDto.item_id },
        Languages.ENGLISH,
      );
      const trackPayload = this.payloadService.createTrackPayload(
        trackRequestDto.transaction_id,
        trackRequestDto.callback_url,
        trackRequestDto.order_id,
        trackRequestDto.domain,
        itemDetails,
      );
      this.logger.log('payload and Url', {
        url: this.getUrl.getGclTrackUrl,
        trackPayload: trackPayload,
      });
      const trackResponse = await this.httpService.post(this.getUrl.getGclTrackUrl, trackPayload, {
        Authorization: token,
      });
      this.logger.log('support Response: ', trackResponse);
      return getSuccessResponse(ActionMessage.track, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.log('track :::: error?.response?.data?.error?.message', error?.response?.data?.error?.message);
      if (error?.response?.data?.error?.message == '' || error?.response?.data?.error?.message == undefined) {
        return getSuccessResponse(ActionMessage.track, HttpResponseMessage.OK);
      }

      throw error?.response?.data;
    }
  }

  async onSearch(
    onSearchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      this.logger.log('onSearchResponse', JSON.stringify(onSearchRequestDto));
      sendDataToClients(
        onSearchRequestDto?.data[0]?.context?.transaction_id,
        onSearchRequestDto.data,
        connectedClients,
      );
      await this.fetchSearchDataFromGCL(onSearchRequestDto);
      return onSearchRequestDto;
    } catch (error) {
      throw error;
    }
  }

  async onSelect(
    searchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      const data = searchRequestDto?.data[0];
      this.logger.debug('onSelectRequestDto: ', JSON.stringify(searchRequestDto));
      if (data?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN) {
        const payload = this.sendPayloadService.scholarshipPayload(data);
        sendDataToClients(data?.context?.transaction_id, payload.data, connectedClients);
      } else if (data?.context?.domain === DomainsEnum.COURSE_DOMAIN) {
        const payload = this.sendPayloadService.coursePayload(data);
        sendDataToClients(data?.context?.transaction_id, payload.data, connectedClients);
      } else if (data?.context?.domain === DomainsEnum.BELEM) {
        const payload = this.sendPayloadService.coursePayload(data);
        sendDataToClients(data?.context?.transaction_id, payload.data, connectedClients);
      }

      // sendDataToClients(searchRequestDto?.context?.transaction_id, searchRequestDto?.data, connectedClients);
      return searchRequestDto;
    } catch (error) {
      throw error?.response;
    }
  }

  async onInit(
    initRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      const data = initRequestDto?.data[0];
      this.logger.log('onInit data ', data);
      // if (data.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN) {
      //   const payload = this.sendPayloadService.createInitPayload(initRequestDto?.data?.scholarship);

      //   sendDataToClients(initRequestDto?.context?.transaction_id, payload.data, connectedClients);

      //   const createOrderPayload = this.sendPayloadService.createOrderPayload(initRequestDto?.data?.scholarship);

      //   const userId = this.userTransactions.get(payload.data.transaction_id);
      //   this.logger.log('userId in onInit', userId);
      //   const item: any = await this.itemDumpService.findOne({ item_id: payload.data.item_id });
      //   const dbResponse = await this.orderService.upsertOrder({
      //     ...createOrderPayload,
      //     user_id: userId ? userId : 'user_1234',
      //     item_details: item?._id,
      //     rating: {
      //       rating: '',
      //       review: '',
      //     },
      //     is_added_to_wallet: false,
      //     certificate_url: '',
      //   });
      //   this.logger.log('dbResponse', dbResponse);
      // } else if (data?.context?.domain === DomainsEnum.COURSE_DOMAIN) {
      //   const payload = this.sendPayloadService.createInitPayload(data);
      //   sendDataToClients(initRequestDto?.context?.transaction_id, payload.data, connectedClients);
      // }
      if (data?.context?.domain === DomainsEnum.BELEM) {
        // payment gateway
        this.logger.log('CallBackUrl: ', this.getUrl.getPaymentVerifyUrl);
        const paymentPayload = {
          amount: data?.message?.order?.quote?.price?.value == 0 ? 100 : data?.message?.order?.quote?.price?.value,
          currency: data?.message?.order?.quote?.price?.currency,
          description: `Payment for ${data?.message?.order?.items[0]?.name}`,
          customerName: data?.message?.order?.billing?.name,
          customerContact: data?.message?.order?.billing?.contact?.phone || '+917870600457',
          customerEmail: data?.message?.order?.billing?.email,
          callbackUrl: this.getUrl.getPaymentVerifyUrl,
          callbackMethod: 'get',
        };
        this.logger.log('paymentPayload: ', paymentPayload);
        const getPaymentDetails = await this.paymentService.createPaymentLink(paymentPayload);
        this.logger.log('getPaymentDetails: ', getPaymentDetails);

        const payload = this.sendPayloadService.coursePayload(data);
        this.logger.log('payload: ', payload);

        sendDataToClients(
          data?.context?.transaction_id,
          { ...payload.data, paymentUrl: getPaymentDetails?.payment_url },
          connectedClients,
        );
        const createOrderPayload = this.sendPayloadService.createInitOrderPayload(data);
        const userId = this.userTransactions.get(payload.data.transaction_id);
        this.logger.log('userId in onInit', userId);
        const item: any = await this.itemDumpService.findOne({ item_id: payload.data.item_id });
        this.logger.log('Payment Status', getPaymentDetails?.status);
        const dbResponse = await this.orderService.upsertOrder({
          ...createOrderPayload,
          user_id: userId ? userId : 'user_1234',
          item_details: item?._id,
          rating: {
            rating: '',
            review: '',
          },
          paymentId: getPaymentDetails?.razorpay_order_id,
          paymentStatus: getPaymentDetails?.status,
          is_added_to_wallet: false,
          certificate_url: '',
        });
        this.logger.log('Belem dbResponse: ', dbResponse);
      }
    } catch (error) {
      this.logger.log(error);
      throw error?.response;
    }
  }

  async onConfirm(
    searchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      this.logger.debug('onConfirm response ===================', JSON.stringify(searchRequestDto));
      const data = searchRequestDto?.data[0];
      // searchRequestDto = Convert.toIOnConfirmDto(searchRequestDto);

      // if (searchRequestDto?.data[0]?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN) {
      //   const payload = this.sendPayloadService.createConfirmPayload(searchRequestDto?.data?.scholarship);
      //   this.logger.debug('searchRequestDto?.context', searchRequestDto?.context);
      //   sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
      //   const createOrderPayload = this.sendPayloadService.createOrderPayload(searchRequestDto?.data?.scholarship);
      //   const userId = this.userTransactions.get(payload.data.transaction_id);
      //   const item: any = await this.itemDumpService.findOne({ item_id: payload.data.item_id });
      //   const dbResponse = await this.orderService.create({
      //     ...createOrderPayload,
      //     user_id: userId ? userId : 'user_1234',
      //     item_details: item?._id,
      //     rating: {
      //       rating: '',
      //       review: '',
      //     },
      //     is_added_to_wallet: false,
      //     certificate_url: '',
      //   });
      //   this.logger.log('dbResponse', dbResponse);
      // }

      if (data?.context?.domain === DomainsEnum.COURSE_DOMAIN || data?.context?.domain === DomainsEnum.BELEM) {
        const payload = this.sendPayloadService.createConfirmPayload(data);
        this.logger.debug('data?.context', data?.context);
        const createOrderPayload = this.sendPayloadService.createConfirmOrderPayload(data);
        this.logger.log('createOrderPayload', createOrderPayload);
        const userId = this.userTransactions.get(payload.data.transaction_id);
        this.logger.log('userId in onConfirm', userId);
        const item: any = await this.itemDumpService.findOne({ item_id: payload.data.item_id });
        const dbResponse = await this.orderService.updateByTransaction(payload.data.transaction_id, {
          ...createOrderPayload,
          user_id: userId ? userId : 'user_1234',
          item_details: item?._id,
          rating: {
            rating: '',
            review: '',
          },
          is_added_to_wallet: false,
          certificate_url: '',
        });
        this.logger.log('OnConfirm ---->Db Response:::', dbResponse);
        sendDataToClients(
          data?.context?.transaction_id,
          { ...payload.data, paymentStatus: dbResponse?.paymentStatus },
          connectedClients,
        );
      }
    } catch (error) {
      throw error?.response;
    }
  }

  async onStatus(
    onStatusRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      const data = onStatusRequestDto?.data[0];
      this.logger.log('onStatusRequestDto', onStatusRequestDto);
      if (onStatusRequestDto?.data?.scholarship?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN) {
        const payload = this.sendPayloadService.statusPayload(onStatusRequestDto?.data?.scholarship);
        sendDataToClients(onStatusRequestDto?.context?.transaction_id, payload.data, connectedClients);
      }

      if (data?.context?.domain === DomainsEnum.COURSE_DOMAIN || data?.context?.domain === DomainsEnum.BELEM) {
        const payload = this.sendPayloadService.statusPayload(data);
        this.logger.log('payload=======', JSON.stringify(payload));
        const order_id = payload?.data?.order_id;
        const certificate_url = payload?.data?.certificate_url;
        await this.orderService.updateOrder(order_id, {
          certificate_url: certificate_url,
          status: payload?.data?.status,
        });
        sendDataToClients(data?.context?.transaction_id, payload.data, connectedClients);
      }

      return onStatusRequestDto;
    } catch (error) {
      throw error;
    }
  }

  async onRate(
    onRateRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      const data = onRateRequestDto?.data[0];
      const payload = this.sendPayloadService.ratePayload(data);
      this.logger.log('Rate payload=======', JSON.stringify(payload));
      sendDataToClients(data?.context?.transaction_id, payload.data, connectedClients);
      return onRateRequestDto;
    } catch (error) {
      throw error;
    }
  }

  async onCancel(
    onCancelRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      const data = onCancelRequestDto?.data[0];
      this.logger.log('onCancelRequestDto', onCancelRequestDto);
      const payload = this.sendPayloadService.cancelPayload(data);
      this.logger.log('Cancel payload=======', JSON.stringify(payload));
      sendDataToClients(data?.context?.transaction_id, payload.data, connectedClients);
      return onCancelRequestDto;
    } catch (error) {
      throw error;
    }
  }

  async onUpdate(
    onUpdateRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      const data = onUpdateRequestDto?.data[0];
      this.logger.log('onUpdateRequestDto', onUpdateRequestDto);
      const payload = this.sendPayloadService.updatePayload(data);
      this.logger.log('Update payload=======', JSON.stringify(payload));
      sendDataToClients(data?.context?.transaction_id, payload.data, connectedClients);
      return onUpdateRequestDto;
    } catch (error) {
      throw error;
    }
  }

  async onTrack(
    onTrackRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      const data = onTrackRequestDto?.data[0];
      this.logger.log('onTrackRequestDto', onTrackRequestDto);
      const payload = this.sendPayloadService.trackPayload(data);
      this.logger.log('Track payload=======', JSON.stringify(payload));
      sendDataToClients(data?.context?.transaction_id, payload.data, connectedClients);
      return onTrackRequestDto;
    } catch (error) {
      throw error;
    }
  }

  async onSupport(
    onSupportRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      const data = onSupportRequestDto?.data[0];
      this.logger.log('onSupportRequestDto', onSupportRequestDto);
      const payload = this.sendPayloadService.supportPayload(data);
      this.logger.log('Support Payload=======', JSON.stringify(payload));
      sendDataToClients(data?.context?.transaction_id, payload.data, connectedClients);
      return onSupportRequestDto;
    } catch (error) {
      throw error;
    }
  }
}

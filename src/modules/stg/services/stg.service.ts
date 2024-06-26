import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

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
import { getTransformedItems, stringToBool } from '../../../utils/helpers';
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
    private readonly sendPayloadService: ResponsePayloadUtilsService,
    private readonly orderService: OrderDumpService,
  ) {
    this.deviceIdMapper = new Map();
    this.serverDefaultLanguage = this.configService.get('serverDefaultLanguage');
    this.userTransactions = new Map();
  }

  // Sets CRON Job at 4:00 AM
  @Cron('00 04 * * *')
  handleCustomCron() {
    this.logger.log('Called at 4:00 AM every day');
    this.fetchSearchData();
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

  async fetchSearchData() {
    try {
      const limit = 5;
      let skip = 0;
      let hasMoreItems = true;
      while (hasMoreItems) {
        const getItemsData = await this.httpService.get(this.getUrl.getSearchItems, {
          pageSize: limit,
          pageNumber: skip,
        });
        if (getItemsData.length > 0) {
          await this.receiveCatalogData(getItemsData);
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

  async select(token: string, selectRequestDto: SelectRequestDto) {
    try {
      this.logger.debug('selectRequestDto====', selectRequestDto);
      const selectPayload = this.payloadService.createSelectPayload(selectRequestDto);
      const selectResponse = await this.httpService.post(this.getUrl.getStgSelectUrl, selectPayload, {
        Authorization: token,
      });
      return getSuccessResponse(selectResponse, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.log(error);
      throw error?.response?.data;
    }
  }
  async init(token: string, initRequestDto: InitRequestDto) {
    try {
      this.logger.debug('initRequestDto====', initRequestDto);
      const user: IUserInfo = (
        await this.httpService.get(this.getUrl.getUserProfileUrl, { translate: false }, { Authorization: token })
      )?.data;
      const initPayload = this.payloadService.createInitPayload(initRequestDto, user);
      const intiResponse = await this.httpService.post(this.getUrl.getStgInitUrl, initPayload, {
        Authorization: token,
      });
      return getSuccessResponse(intiResponse, HttpResponseMessage.OK);
    } catch (error) {
      this.logger.error(error);
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
      const userId = user._id;
      this.logger.log('userId', userId);
      const confirmPayload = this.payloadService.createConfirmPayload(confirmRequestDto, user);
      this.userTransactions.set(confirmRequestDto.transaction_id, userId);
      const confirmResponse = await this.httpService.post(this.getUrl.getStgConfirmUrl, confirmPayload, {
        Authorization: token,
      });
      return getSuccessResponse(confirmResponse, HttpResponseMessage.OK);
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async status(token: string, statusRequestDto: StatusRequestDto) {
    try {
      this.logger.debug('statusRequestDto', statusRequestDto);
      const user = (
        await this.httpService.get(this.getUrl.getUserProfileUrl, { translate: false }, { Authorization: token })
      )?.data;
      const userId = user._id;
      const statusPayload = this.payloadService.createStatusPayload(statusRequestDto);

      const order = await this.orderService.fetchOrderDetails(
        userId,
        statusRequestDto.transaction_id,
        statusRequestDto.item_id,
        statusRequestDto.order_id,
      );
      this.logger.log('order', order);
      const provider_id = order?.provider?.id;

      this.logger.log('userId', userId);
      this.userTransactions.set(statusRequestDto.item_id, [userId, statusRequestDto.order_id]);

      const statusResponse = await this.httpService.post(
        this.getUrl.getStgStatusUrl,
        {
          ...statusPayload,
          message: {
            ...statusPayload.message,
            order: { ...statusPayload.message.order, items_id: [statusRequestDto.item_id], provider_id: provider_id },
          },
        },
        {
          Authorization: token,
        },
      );
      return statusResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async onSelect(
    searchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      this.logger.debug('searchRequestDto====', JSON.stringify(searchRequestDto));
      if (searchRequestDto?.data?.scholarship?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN) {
        const payload = this.sendPayloadService.scholarshipPayload(searchRequestDto?.data?.scholarship);
        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
      } else if (searchRequestDto?.data?.course?.context?.domain === DomainsEnum.COURSE_DOMAIN) {
        const payload = this.sendPayloadService.coursePayload(searchRequestDto?.data?.course);
        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
      } else if (searchRequestDto?.data?.course?.context?.domain === DomainsEnum.BELEM) {
        const payload = this.sendPayloadService.coursePayload(searchRequestDto?.data?.course);
        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
      }

      // sendDataToClients(searchRequestDto?.context?.transaction_id, searchRequestDto?.data, connectedClients);
      return searchRequestDto;
    } catch (error) {
      throw error?.response;
    }
  }

  async onInit(
    searchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      if (searchRequestDto?.data?.scholarship?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN) {
        const payload = this.sendPayloadService.createInitPayload(searchRequestDto?.data?.scholarship);
        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
      } else if (searchRequestDto?.data?.course?.context?.domain === DomainsEnum.COURSE_DOMAIN) {
        const payload = this.sendPayloadService.createInitPayload(searchRequestDto?.data?.course);
        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
      } else if (searchRequestDto?.data?.course?.context?.domain === DomainsEnum.BELEM) {
        const payload = this.sendPayloadService.coursePayload(searchRequestDto?.data?.course);
        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
      }
    } catch (error) {
      throw error?.response;
    }
  }

  async onConfirm(
    searchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      if (searchRequestDto?.data?.scholarship?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN) {
        const payload = this.sendPayloadService.createConfirmPayload(searchRequestDto?.data?.scholarship);
        this.logger.debug('searchRequestDto?.context', searchRequestDto?.context);
        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
        const createOrderPayload = this.sendPayloadService.createOrderPayload(searchRequestDto?.data?.scholarship);
        const userId = this.userTransactions.get(payload.data.transaction_id);
        const item: any = await this.itemDumpService.findOne({ item_id: payload.data.item_id });
        const dbResponse = await this.orderService.create({
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
        this.logger.log('dbResponse', dbResponse);
      }

      if (
        searchRequestDto?.data?.course?.context?.domain === DomainsEnum.COURSE_DOMAIN ||
        searchRequestDto?.data?.course?.context?.domain === DomainsEnum.BELEM
      ) {
        const payload = this.sendPayloadService.createConfirmPayload(searchRequestDto?.data?.course);
        this.logger.debug('searchRequestDto?.context', searchRequestDto?.context);
sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
        const createOrderPayload = this.sendPayloadService.createOrderPayload(searchRequestDto?.data?.course);
        const userId = this.userTransactions.get(payload.data.transaction_id);
        this.logger.log('userId in onConfirm', userId);
        const item: any = await this.itemDumpService.findOne({ item_id: payload.data.item_id });
        await this.orderService.create({
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
        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
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
      this.logger.log('searchRequestDto', onStatusRequestDto);
      if (onStatusRequestDto?.data?.scholarship?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN) {
        const payload = this.sendPayloadService.statusPayload(onStatusRequestDto?.data?.scholarship);
        sendDataToClients(onStatusRequestDto?.context?.transaction_id, payload.data, connectedClients);
      }

      if (
        onStatusRequestDto?.data?.course?.context?.domain === DomainsEnum.COURSE_DOMAIN ||
        onStatusRequestDto?.data?.course?.context?.domain === DomainsEnum.BELEM
      ) {
        const payload = this.sendPayloadService.statusPayload(onStatusRequestDto?.data?.course);
        this.logger.log('payload=======', JSON.stringify(payload));
        const order_id = payload?.data?.order_id;
        const certificate_url = payload?.data?.certificate_url;
        await this.orderService.updateOrder(order_id, {
          certificate_url: certificate_url,
          status: payload?.data?.status,
        });
        sendDataToClients(onStatusRequestDto?.context?.transaction_id, payload.data, connectedClients);
      }

      return onStatusRequestDto;
    } catch (error) {
      throw error;
    }
  }
}

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
import { getTransformedItems } from '../../../utils/helpers';
import { CreateItemDumpDto, BulkCreateItemDumpDto } from '../../dump/dto/create-item-dump.dto';
import { ItemDumpService } from '../../dump/service/item-dump.service';
import { OrderDumpService } from '../../dump/service/order-dump.service';
import { KafkaConsumerService } from '../../kafka/consumer/consumer.service';
import { PaginationRequestQuery } from '../dto/pagination-request.dto';
import { RawCatalogueData } from '../schema/catalogue.items.interface';
import { TranslationResponse } from '../schema/translation.response.interface';

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
  async search(pagination: PaginationRequestQuery, searchRequestDto: SearchRequestDto) {
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
      const domains = userDevicePreference.data?.domainData || [];
      const getItems = await this.itemDumpService.findPaginatedItems(
        [],
        languageCode,
        pagination.page,
        pagination.pageSize,
        searchRequestDto.searchQuery,
        domains,
      );
      const itemIds = (getItems['items'] as []).map((item) => item['item_id']);

      const translatedItems = await this.itemDumpService.findPaginatedItems(
        itemIds,
        languageCode,
        pagination.page,
        pagination.pageSize,
        searchRequestDto.searchQuery,
        domains,
      );
      return translatedItems;
    } catch (error) {
      throw error;
    }
  }

  private async receiveCatalogData(data: RawCatalogueData[]) {
    try {
      await Promise.allSettled(
        data.map(async (dataElement) => {
          const transformedItems = getTransformedItems(dataElement);
          await this.itemDumpService.bulkWrite(
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
                  }),
              ),
            },
            Languages.ENGLISH,
          );

          // transformedItems.forEach(async (item) => {
          //   await this.elasticsearchService.create('items', item.item_id, {
          //     id: item.item_id,
          //     item_name: item.descriptor.name,
          //     provider_id: item.provider_id,
          //     provider_name: item.provider.name,
          //     category_id: '',
          //     category_name: '',
          //   });
          // });
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
          // Process the current batch of items
        }

        // Check if there are more items to fetch
        hasMoreItems = items.length === limit;
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
      const getItemsData = await this.httpService.get(this.getUrl.getSearchItems);
      await this.receiveCatalogData(getItemsData);
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
      return selectResponse;
    } catch (error) {
      this.logger.log(error);
      throw error?.response?.data;
    }
  }
  async init(token: string, initRequestDto: InitRequestDto) {
    try {
      this.logger.debug('initRequestDto====', initRequestDto);

      const initPayload = this.payloadService.createInitPayload(initRequestDto, null);
      const searchResponse = await this.httpService.post(this.getUrl.getStgInitUrl, initPayload, {
        Authorization: token,
      });
      return searchResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async confirm(token: string, confirmRequestDto: ConfirmRequestDto) {
    this.logger.log('token', token);
    try {
      this.logger.debug('confirmRequestDto====', confirmRequestDto);
      const user = (
        await this.httpService.get(this.getUrl.getUserProfileUrl, { translate: false }, { Authorization: token })
      )?.data;
      const userId = user._id;
      this.logger.log('userId', userId);
      const confirmPayload = this.payloadService.createConfirmPayload(confirmRequestDto);
      this.userTransactions.set(confirmRequestDto.transaction_id, userId);
      const searchResponse = await this.httpService.post(this.getUrl.getStgConfirmUrl, confirmPayload, {
        Authorization: token,
      });
      return searchResponse;
    } catch (error) {
      throw error?.response?.data;
    }
  }

  async status(token: string, statusRequestDto: StatusRequestDto) {
    try {
      this.logger.debug('statusRequestDto', statusRequestDto);

      const statusPayload = this.payloadService.createStatusPayload(statusRequestDto);

      const user = (
        await this.httpService.get(this.getUrl.getUserProfileUrl, { translate: false }, { Authorization: token })
      )?.data;
      const userId = user._id;
      this.logger.log('userId', userId);
      this.userTransactions.set(statusRequestDto.item_id, [userId, statusRequestDto.order_id]);

      const searchResponse = await this.httpService.post(this.getUrl.getStgStatusUrl, statusPayload, {
        Authorization: token,
      });
      return searchResponse;
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
      if (searchRequestDto?.data?.scholarship?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN) {
        const payload = this.sendPayloadService.scholarshipPayload(searchRequestDto?.data?.scholarship);
        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
      }

      if (searchRequestDto?.data?.course?.context?.domain === DomainsEnum.COURSE_DOMAIN) {
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
      }

      if (searchRequestDto?.data?.course?.context?.domain === DomainsEnum.COURSE_DOMAIN) {
        const payload = this.sendPayloadService.createInitPayload(searchRequestDto?.data?.course);
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
        const createOrderPayload = this.sendPayloadService.createOrderPayload(searchRequestDto?.data?.scholarship);
        const userId = this.userTransactions.get(payload.data.transaction_id);
        const item: any = await this.itemDumpService.findOne({ item_id: payload.data.item_id });
        const dbResponse = await this.orderService.create({
          ...createOrderPayload,
          user_id: userId ? userId : 'user_1234',
          internal_item_id: item?._id,
        });
        this.logger.log('dbResponse', dbResponse);

        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
      }

      if (searchRequestDto?.data?.course?.context?.domain === DomainsEnum.COURSE_DOMAIN) {
        const payload = this.sendPayloadService.createConfirmPayload(searchRequestDto?.data?.course);
        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);

        const createOrderPayload = this.sendPayloadService.createOrderPayload(searchRequestDto?.data?.course);
        const userId = this.userTransactions.get(payload.data.transaction_id);
        this.logger.log('userId in onConfirm', userId);
        const item: any = await this.itemDumpService.findOne({ item_id: payload.data.item_id });
        await this.orderService.create({
          ...createOrderPayload,
          user_id: userId ? userId : 'user_1234',
          internal_item_id: item?._id,
        });
      }
    } catch (error) {
      throw error?.response;
    }
  }

  async onStatus(
    searchRequestDto: any,
    connectedClients: Map<string, any>,
    sendDataToClients: (transaction_id: string, data: any, connectedClients: Map<string, any>) => void,
  ) {
    try {
      if (searchRequestDto?.data?.scholarship?.context?.domain === DomainsEnum.SCHOLARSHIP_DOMAIN) {
        const payload = this.sendPayloadService.statusPayload(searchRequestDto?.data?.scholarship);
        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
      }

      if (searchRequestDto?.data?.course?.context?.domain === DomainsEnum.COURSE_DOMAIN) {
        const payload = this.sendPayloadService.statusPayload(searchRequestDto?.data?.course);
        sendDataToClients(searchRequestDto?.context?.transaction_id, payload.data, connectedClients);
      }

      return searchRequestDto;
    } catch (error) {
      throw error;
    }
  }
}

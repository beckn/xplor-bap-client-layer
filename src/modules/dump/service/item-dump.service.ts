import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';

import { CreateItemDumpDto, BulkCreateItemDumpDto } from '../dto/create-item-dump.dto';
import { ItemDump, ItemDocument, ItemModel } from '../schema/item.schema';
import { HindiItemDumpDocument, HindiItemModel } from '../schema/hindi-item.schema';
import { PunjabiItemDumpDocument, PunjabiItemModel } from '../schema/punjabi-item.schema';
import { PortugueseItemDump, PortugueseItemModel } from '../schema/portuguese-item.schema';
import { SpanishItemDumpDocument, SpanishItemModel } from '../schema/spanish-item.schema';
import { DomainsEnum, Languages } from '../../../common/constants/enums';
import { ITEM_ERROR_MESSAGES } from '../../../common/constants/error-message';

@Injectable()
export class ItemDumpService {
  private models: Record<string, Model<any>>;
  private readonly logger: Logger = new Logger(ItemDumpService.name);
  constructor(
    @InjectModel(ItemModel) private dumpModel: Model<ItemDocument>,
    @InjectModel(HindiItemModel) private hindiItemModel: Model<HindiItemDumpDocument>,
    @InjectModel(PunjabiItemModel) private punjabiItemModel: Model<PunjabiItemDumpDocument>,
    @InjectModel(PortugueseItemModel) private portugueseItemModel: Model<PortugueseItemDump>,
    @InjectModel(SpanishItemModel) private spanishItemModel: Model<SpanishItemDumpDocument>,
  ) {
    this.models = {
      [Languages.HINDI]: this.hindiItemModel,
      [Languages.PUNJABI]: this.punjabiItemModel,
      [Languages.ENGLISH]: this.dumpModel,
      [Languages.SPANISH]: this.spanishItemModel,
      [Languages.PORTUGUESE]: this.portugueseItemModel,
      // Add other language models here
    };
  }
  async create(language: string, createItemDumpDto: CreateItemDumpDto): Promise<ItemDump> {
    const model = this.getModel(language);
    const createdItem = new model(createItemDumpDto);
    return createdItem.save();
  }

  // async findOneItem(itemId: string, language: string): Promise<any> {
  //   const model = this.getModel(language);
  //   const foundItem = await model.findById({ _id: itemId }).lean();
  //   if (!foundItem) throw new NotFoundException(ITEM_ERROR_MESSAGES.ITEM_NOT_FOUND);
  //   return foundItem;
  // }

  async findOneItem(itemId: string, language: string, userId: string): Promise<any> {
    const model = this.getModel(language);
    // Aggregation pipeline to find the item and check for enrollment
    const pipeline = [
      {
        $match: { _id: itemId },
      },
      {
        $lookup: {
          from: 'orders',
          let: { itemId: '$item_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$item_id', '$$itemId'] }, { $eq: ['$user_id', userId] }],
                },
              },
            },
          ],
          as: 'orders',
        },
      },
      {
        $addFields: {
          enrolled: {
            $cond: { if: { $gt: [{ $size: '$orders' }, 0] }, then: true, else: false },
          },
          status: {
            $cond: {
              if: { $gt: [{ $size: '$orders' }, 0] },
              then: { $arrayElemAt: ['$orders.status', 0] },
              else: null,
            },
          },
        },
      },
      { $unset: 'orders' },
    ];

    const foundItems = await model.aggregate(pipeline).exec();
    if (foundItems.length === 0) throw new NotFoundException(ITEM_ERROR_MESSAGES.ITEM_NOT_FOUND);

    return foundItems[0];
  }

  async findWithFilters(language: string): Promise<ItemDump[]> {
    const model = this.getModel(language);
    return await model.find();
  }

  async findAll(filters: any, skip: number, limit: number): Promise<ItemDump[]> {
    return await this.dumpModel.find(filters).skip(skip).limit(limit).exec();
  }

  async countItems(filters: any): Promise<number> {
    return await this.dumpModel.countDocuments(filters);
  }

  async bulkWrite(bulkCreateItemDumpDto: BulkCreateItemDumpDto, language: string) {
    const model = this.getModel(language);
    this.logger.log(`BulkWrite ${JSON.stringify(bulkCreateItemDumpDto.items)}`);
    const bulkOperations = bulkCreateItemDumpDto.items.map((item: CreateItemDumpDto) => ({
      updateOne: {
        filter: { item_id: item.item_id },
        update: {
          $set: {
            domain: item.domain,
            descriptor: {
              name: item.descriptor.name,
              images: item.descriptor.images,
              long_desc: item.descriptor.long_desc,
              short_desc: item.descriptor.short_desc,
            },
            price: item.price,
            provider_id: item.provider_id,
            provider: {
              name: item.provider.name,
              images: item.provider.images,
              long_desc: item.provider.long_desc,
              short_desc: item.provider.short_desc,
            },
            transaction_id: item.transaction_id,
            rating: item.rating,
            rateable: item.rateable,
            creator:
              item.creator !== null
                ? {
                    name: item.creator.name,
                    images: item.creator.images,
                    long_desc: item.creator.long_desc,
                    short_desc: item.creator.short_desc,
                  }
                : [],
            tags: item.tags,
          },
        },
        upsert: true, // this option creates a new document if no document matches the filter
      },
    }));
    return await model.bulkWrite([...bulkOperations]);
  }

  async findByTransactionId(transaction_id: string, request_type: string): Promise<ItemDump> {
    return await this.dumpModel.findOne({ transaction_id, request_type });
  }

  async findByDeviceId(device_id: string, request_type: string): Promise<ItemDump> {
    return await this.dumpModel.findOne({ device_id, request_type });
  }

  async findPaginatedItemsForOrders(
    itemIds: string[],
    language: string,
    page: number,
    limit: number,
    keywords: string,
    domains: any[],
  ): Promise<any> {
    const model = this.getModel(language);
    // Constructing the domain filter condition
    const domainFilterCondition = domains.map((value) => value.domain);
    domainFilterCondition.push(DomainsEnum.BELEM);
    const totalCount = await model.countDocuments(
      itemIds.length > 0
        ? { ...(itemIds.length != 0 && { item_id: { $in: itemIds } }) }
        : {
            $or: [
              {
                'descriptor.name': { $regex: keywords.toString(), $options: 'i' },
                domain: { $in: domainFilterCondition },
              },
            ],
          },
    );
    page <= 0 ? (page = 1) : page;
    limit <= 0 ? (limit = 10) : limit;
    const skip = page * limit;
    const items = await model
      .find(
        itemIds.length > 0
          ? { ...(itemIds.length != 0 && { item_id: { $in: itemIds } }) }
          : {
              $or: [
                {
                  'descriptor.name': { $regex: keywords.toString(), $options: 'i' },
                  domain: { $in: domainFilterCondition },
                },
              ],
            },
      )
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: -1 })
      .select('-creator -tags')
      .exec();
    return { totalCount, transaction_id: uuidV4(), skip, limit, items };
  }

  async findPaginatedItems(
    itemIds: string[],
    providerIds: string[],
    language: string,
    page: number,
    limit: number,
    keywords: string,
    domains: any[],
    userId: string, // Added userId parameter
  ): Promise<any> {
    const model = this.getModel(language);
    // const ordersModel = this.getOrdersModel(); // Assuming a method to get the orders model

    // Constructing the domain filter condition
    const domainFilterCondition = domains.map((value) => value.domain);
    domainFilterCondition.push(DomainsEnum.BELEM);

    page <= 0 ? (page = 1) : page;
    limit <= 0 ? (limit = 10) : limit;
    const skip = (page - 1) * limit;
    // Aggregation pipeline
    const pipeline: any = [
      {
        $match:
          itemIds.length > 0
            ? { item_id: { $in: itemIds }, provider_id: { $in: providerIds } }
            : {
                $or: [
                  {
                    'descriptor.name': { $regex: keywords, $options: 'i' },
                    domain: { $in: domainFilterCondition },
                  },
                ],
              },
      },
      {
        $lookup: {
          from: 'orders',
          let: { itemId: '$item_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$item_id', '$$itemId'] }, { $eq: ['$user_id', userId] }],
                },
              },
            },
            {
              $project: {
                status: 1,
              },
            },
          ],
          as: 'orders',
        },
      },
      {
        $addFields: {
          enrolled: {
            $cond: { if: { $gt: [{ $size: '$orders' }, 0] }, then: true, else: false },
          },
          status: {
            $cond: {
              if: { $gt: [{ $size: '$orders' }, 0] },
              then: { $arrayElemAt: ['$orders.status', 0] },
              else: null,
            },
          },
        },
      },
      { $unset: ['creator', 'tags', 'orders'] },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ];

    const [items, totalCountResult] = await Promise.all([
      model.aggregate(pipeline).exec(),
      model
        .countDocuments(
          itemIds.length > 0
            ? { item_id: { $in: itemIds }, provider_id: { $in: providerIds } }
            : {
                $or: [
                  {
                    'descriptor.name': { $regex: keywords, $options: 'i' },
                    domain: { $in: domainFilterCondition },
                  },
                ],
              },
        )
        .exec(),
    ]);

    const totalCount = totalCountResult;

    // this.logger.log({ totalCount, transaction_id: uuidV4(), skip, limit, items });

    return { totalCount, transaction_id: uuidV4(), skip, limit, items };
  }

  private getModel(language: string): Model<any> {
    const model = this.models[language];
    if (!model) {
      return this.models[Languages.ENGLISH];
    }

    return model;
  }

  async findOne(filter: any): Promise<ItemDump[]> {
    return await this.dumpModel.findOne(filter);
  }

  async findByItemId(filter: any, language: string): Promise<ItemDump> {
    const model = this.getModel(language);
    return await model.findOne(filter);
  }
}

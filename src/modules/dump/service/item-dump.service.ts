import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateItemDumpDto, BulkCreateItemDumpDto } from '../dto/create-item-dump.dto';
import { ItemDump, ItemDocument, ItemModel } from '../schema/item.schema';
import { HindiItemDumpDocument, HindiItemModel } from '../schema/hindi-item.schema';
import { PunjabiItemDumpDocument, PunjabiItemModel } from '../schema/punjabi-item.schema';
import { PortugueseItemDump, PortugueseItemModel } from '../schema/portuguese-item.schema';
import { SpanishItemDumpDocument, SpanishItemModel } from '../schema/spanish-item.schema';
import { Languages } from '../../../common/constants/enums';

@Injectable()
export class ItemDumpService {
  private models: Record<string, Model<any>>;
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
    const bulkCreateItemDump = bulkCreateItemDumpDto.items.map((item: CreateItemDumpDto) => ({
      item_id: item.item_id,
      domain: item.domain,
      descriptor: item.descriptor,
      price: item.price,
      provider_id: item.provider_id,
      provider: item.provider,
      transaction_id: item.transaction_id,
    }));
    return await model.insertMany([...bulkCreateItemDump]);
  }

  async findByTransactionId(transaction_id: string, request_type: string): Promise<ItemDump> {
    return await this.dumpModel.findOne({ transaction_id, request_type });
  }

  async findByDeviceId(device_id: string, request_type: string): Promise<ItemDump> {
    return await this.dumpModel.findOne({ device_id, request_type });
  }

  async findPaginatedItems(
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
    const totalCount = await model.countDocuments({
      $or: [
        {
          'descriptor.name': { $regex: keywords.toString(), $options: 'i' },
          domain: { $in: domainFilterCondition },
        },
      ],
    });
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
      .exec();
    return { totalCount, skip, limit, items };
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
}

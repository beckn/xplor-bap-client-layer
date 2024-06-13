import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItemDocument, ItemModel } from '../schema/item.schema';
import { StgService } from './../../../modules/stg/services/stg.service';

@Injectable()
export class ItemWatcherService implements OnModuleInit, OnModuleDestroy {
  private changeStream: any;
  // @InjectModel(ItemModel) private dumpModel: Model<ItemDocument>,
  constructor(
    @InjectModel(ItemModel) private readonly itemModel: Model<ItemDocument>,
    private readonly stgService: StgService,
  ) {}

  onModuleInit() {
    this.startChangeStream();
  }

  onModuleDestroy() {
    if (this.changeStream) {
      this.changeStream.close();
    }
  }

  startChangeStream() {
    this.changeStream = this.itemModel.watch([], { fullDocument: 'updateLookup' });
    this.changeStream.on('change', (change) => {
      if (
        change.operationType === 'update' &&
        !Object.keys(change.updateDescription.updatedFields).some((value) =>
          ['views', 'rating', 'rateable'].includes(value),
        )
      ) {
        this.handleUpdate(change.fullDocument);
      }
    });
  }

  async handleUpdate(document: any) {
    // Perform action for update

    await this.stgService.translateItem([document]);
  }
}

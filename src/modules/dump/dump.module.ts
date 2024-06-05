import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemSchema, ItemModel, ItemDumpModel } from './schema/item.schema';
import { ItemDumpService } from './service/item-dump.service';
import { HindiItemDumpSchema, HindiItemModel } from './schema/hindi-item.schema';
import { PunjabiItemDumpSchema, PunjabiItemModel } from './schema/punjabi-item.schema';
import { PortugueseItemDumpSchema, PortugueseItemModel } from './schema/portuguese-item.schema';
import { SpanishItemDumpSchema, SpanishItemModel } from './schema/spanish-item.schema';
import { OrderModel, OrderSchema } from './schema/order.schema';
import { OrderDumpService } from './service/order-dump.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ItemModel, schema: ItemSchema }]),
    MongooseModule.forFeature([{ name: HindiItemModel, schema: HindiItemDumpSchema }]),
    MongooseModule.forFeature([{ name: PunjabiItemModel, schema: PunjabiItemDumpSchema }]),
    MongooseModule.forFeature([{ name: PortugueseItemModel, schema: PortugueseItemDumpSchema }]),
    MongooseModule.forFeature([{ name: SpanishItemModel, schema: SpanishItemDumpSchema }]),
    MongooseModule.forFeature([{ name: OrderModel, schema: OrderSchema }]),
  ],
  providers: [ItemDumpService, ItemDumpModel, OrderDumpService],
  exports: [ItemDumpService, ItemDumpModel, OrderDumpService],
})
export class DumpModule {}

import { Model } from 'mongoose';
import { HindiItemDumpModel } from '../modules/dump/schema/hindi-item.schema';
import { Languages } from '../common/constants/enums';
import { ItemDumpModel } from '../modules/dump/schema/item.schema';
import { PortugueseItemDumpModel } from '../modules/dump/schema/portuguese-item.schema';
import { PunjabiItemDumpModel } from '../modules/dump/schema/punjabi-item.schema';
import { SpanishItemDumpModel } from '../modules/dump/schema/spanish-item.schema';
export function getDBModelByLanguage(languageCode: string): Model<any> {
  switch (languageCode) {
    case Languages.HINDI:
      return HindiItemDumpModel;
    case Languages.PUNJABI:
      return PunjabiItemDumpModel;
    case Languages.PORTUGUESE:
      return PortugueseItemDumpModel;
    case Languages.SPANISH:
      return SpanishItemDumpModel;
    default:
      return ItemDumpModel;
  }
}

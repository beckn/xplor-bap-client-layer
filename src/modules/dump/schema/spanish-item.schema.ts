import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Languages } from '../../../common/constants/enums';

@Schema()
export class Descriptor {
  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  long_desc: string;

  @Prop({ default: null })
  short_desc: string;

  @Prop({ default: null })
  images: string[];
}

const DescriptorSchema = SchemaFactory.createForClass(Descriptor);

@Schema()
export class Price {
  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  value: string;
}

const PriceSchema = SchemaFactory.createForClass(Price);

@Schema()
export class SpanishItemDump extends Document {
  @Prop({ default: () => `item_${uuidv4()}` })
  _id: string;

  @Prop({ required: true })
  transaction_id: string;

  @Prop({ required: true })
  item_id: string;

  @Prop({ required: true })
  domain: string;

  @Prop({ type: DescriptorSchema, required: true })
  descriptor: Descriptor;

  @Prop({ type: PriceSchema, required: true })
  price: Price;

  @Prop({ required: true })
  provider_id: string;

  @Prop({ required: true })
  rating: string;

  @Prop({ required: true })
  rateable: boolean;

  @Prop({ required: true })
  provider: Descriptor;

  @Prop({ required: true })
  creator: Descriptor;

  @Prop({ required: true, type: [Object] })
  tags: Record<any, any>[];
}

export const SpanishItemModel = SpanishItemDump.name;
export type SpanishItemDumpDocument = SpanishItemDump & Document;
export const SpanishItemDumpSchema = SchemaFactory.createForClass(SpanishItemDump);
export const SpanishItemDumpModel = model<SpanishItemDumpDocument>(`${Languages.SPANISH}_Item`, SpanishItemDumpSchema);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Dump extends Document {
  @Prop({ default: () => `dump_${uuidv4()}` })
  _id: string;
  @Prop({ required: true })
  transaction_id: string;

  @Prop({ type: String, optional: true })
  domain: string | Array<string>;

  @Prop({ type: Array<string> })
  domains: Array<string>;

  @Prop({ required: true })
  request_type: string;

  @Prop({ required: true })
  message_id: string;

  @Prop({ type: Object, required: true })
  context: Record<string, any>;

  @Prop({ type: Object, required: true })
  message: Record<string, any>;
}
export const DumpModel = Dump.name;
export type DumpDocument = Dump & Document;
export const DumpSchema = SchemaFactory.createForClass(Dump);

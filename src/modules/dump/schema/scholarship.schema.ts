import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Scholarship extends Document {
  @Prop({ default: () => `scholarship_${uuidv4()}` })
  _id: string;
  @Prop({ required: true })
  transaction_id: string;

  @Prop({ required: true, unique: true })
  device_id: string;

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
export const ScholarshipModel = Scholarship.name;
export type ScholarshipDocument = Scholarship & Document;
export const ScholarshipSchema = SchemaFactory.createForClass(Scholarship);

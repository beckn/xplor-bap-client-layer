import { Injectable } from '@nestjs/common';
import { CreateDumpDto } from '../dto/create-dump.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Scholarship, ScholarshipDocument } from '../schema/scholarship.schema';

@Injectable()
export class ScholarshipDumpService {
  constructor(@InjectModel(Scholarship.name) private dumpModel: Model<ScholarshipDocument>) {}
  async create(createDumpDto: CreateDumpDto): Promise<Scholarship> {
    return await this.dumpModel.create(createDumpDto);
  }

  async findAll(): Promise<Scholarship[]> {
    return await this.dumpModel.find();
  }

  async findByTransactionId(transaction_id: string, request_type: string): Promise<Scholarship> {
    return await this.dumpModel.findOne({ transaction_id, request_type });
  }

  async findByDeviceId(device_id: string, request_type: string): Promise<Scholarship> {
    return await this.dumpModel.findOne({ device_id, request_type });
  }
}

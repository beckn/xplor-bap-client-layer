import { Injectable } from '@nestjs/common';
import { CreateDumpDto } from '../dto/create-dump.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Retail, RetailDocument } from '../schema/retail.schema';

@Injectable()
export class RetailDumpService {
  constructor(@InjectModel(Retail.name) private dumpModel: Model<RetailDocument>) {}
  async create(createDumpDto: CreateDumpDto): Promise<Retail> {
    return await this.dumpModel.create(createDumpDto);
  }

  async findAll(): Promise<Retail[]> {
    return await this.dumpModel.find();
  }

  async findBytransaction_id(transaction_id: string, request_type: string): Promise<Retail> {
    return await this.dumpModel.findOne({ transaction_id, request_type });
  }

  async findByDeviceId(device_id: string, request_type: string): Promise<Retail> {
    return await this.dumpModel.findOne({ device_id, request_type });
  }
}

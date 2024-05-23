import { Injectable } from '@nestjs/common';
import { CreateDumpDto } from '../dto/create-dump.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from '../schema/job.schema';

@Injectable()
export class JobDumpService {
  constructor(@InjectModel(Job.name) private dumpModel: Model<JobDocument>) {}
  async create(createDumpDto: CreateDumpDto): Promise<Job> {
    return await this.dumpModel.create(createDumpDto);
  }

  async findAll(): Promise<Job[]> {
    return await this.dumpModel.find();
  }

  async findBytransaction_id(transaction_id: string, request_type: string): Promise<Job> {
    return await this.dumpModel.findOne({ transaction_id, request_type });
  }

  async findByDeviceId(device_id: string, request_type: string): Promise<Job> {
    return await this.dumpModel.findOne({ device_id, request_type });
  }
}

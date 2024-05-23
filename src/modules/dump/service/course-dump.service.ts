import { Injectable } from '@nestjs/common';
import { CreateDumpDto } from '../dto/create-dump.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from '../schema/course.schema ';

@Injectable()
export class CourseDumpService {
  constructor(@InjectModel(Course.name) private dumpModel: Model<CourseDocument>) {}
  async create(createDumpDto: CreateDumpDto): Promise<Course> {
    return await this.dumpModel.create(createDumpDto);
  }

  async findAll(): Promise<Course[]> {
    return await this.dumpModel.find();
  }

  async findBytransaction_id(transaction_id: string, request_type: string): Promise<Course> {
    return await this.dumpModel.findOne({ transaction_id, request_type });
  }

  async findByDeviceId(device_id: string, request_type: string): Promise<Course> {
    return await this.dumpModel.findOne({ device_id, request_type });
  }
}

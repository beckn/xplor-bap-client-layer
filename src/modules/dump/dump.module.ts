import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseModel, CourseSchema } from './schema/course.schema ';
import { ScholarshipModel, ScholarshipSchema } from './schema/scholarship.schema';
import { JobModel, JobSchema } from './schema/job.schema';
import { RetailModel, RetailSchema } from './schema/retail.schema';
import { JobDumpService } from './service/job-dump.service';
import { CourseDumpService } from './service/course-dump.service';
import { ScholarshipDumpService } from './service/scholarship-dump.service';
import { RetailDumpService } from './service/retail-dump.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CourseModel, schema: CourseSchema }]),
    MongooseModule.forFeature([{ name: ScholarshipModel, schema: ScholarshipSchema }]),
    MongooseModule.forFeature([{ name: JobModel, schema: JobSchema }]),
    MongooseModule.forFeature([{ name: RetailModel, schema: RetailSchema }]),
  ],
  providers: [JobDumpService, CourseDumpService, ScholarshipDumpService, RetailDumpService],
  exports: [JobDumpService, CourseDumpService, ScholarshipDumpService, RetailDumpService],
})
export class DumpModule {}

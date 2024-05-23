import { Module } from '@nestjs/common';
import { DumpService } from './service/dump.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DumpModel, DumpSchema } from './schema/dump.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: DumpModel, schema: DumpSchema }])],
  providers: [DumpService],
  exports: [DumpService],
})
export class DumpModule {}

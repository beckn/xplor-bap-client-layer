import { Module } from '@nestjs/common';
import { StgService } from './services/stg.service';
import { StgController } from './stg.controller';
import { RequestPayloadUtilsService } from 'src/common/utils/request-payload.utils.service';

@Module({
  controllers: [StgController],
  providers: [StgService, RequestPayloadUtilsService],
})
export class StgModule {}

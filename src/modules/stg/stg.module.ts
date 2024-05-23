import { Module } from '@nestjs/common';
import { StgService } from './services/stg.service';
import { StgController } from './stg.controller';
import { RequestPayloadUtilsService } from 'src/common/utils/request-payload.utils.service';
import { DumpModule } from '../dump/dump.module';
import { AxiosService } from 'src/common/axios/axios.service';

@Module({
  imports: [DumpModule],
  controllers: [StgController],
  providers: [StgService, RequestPayloadUtilsService, AxiosService],
})
export class StgModule {}

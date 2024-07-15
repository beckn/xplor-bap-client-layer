import { Module } from '@nestjs/common';
import { StgService } from './services/stg.service';
import { StgController } from './stg.controller';
import { DumpModule } from '../dump/dump.module';
import { KafkaModule } from '../kafka/kafka.module';
import { AxiosService } from '../../common/axios/axios.service';
import { CommonModule } from '../../common/common.module';
import { RequestPayloadUtilsService } from '../../common/utils/request-payload.utils.service';
import { ResponsePayloadUtilsService } from '../../common/utils/response-payload.utils.service';
import { TranslateService } from '../../services/translate/service/translate.service';
import { PaymentGatewayService } from '../payment-gateway/payment-gateway.service';

@Module({
  imports: [DumpModule, CommonModule, KafkaModule],
  controllers: [StgController],
  providers: [
    TranslateService,
    StgService,
    RequestPayloadUtilsService,
    AxiosService,
    ResponsePayloadUtilsService,
    PaymentGatewayService,
  ],
  // ElasticsearchService, ElasticSearchService],
  exports: [StgService],
})
export class StgModule {}

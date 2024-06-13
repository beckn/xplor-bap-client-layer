import { Module } from '@nestjs/common';
import { ElasticsearchModule, ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticSearchService } from '../service/elastic-search.service';

@Module({
  imports: [
    ConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('esServiceUrl'),
        maxRetries: 10,
        requestTimeout: 60000,
        pingTimeout: 60000,
        sniffOnStart: true,
        // auth: {
        //   username: configService.get('esUsername'),
        //   password: configService.get('esPassword'),
        // },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ElasticsearchService, ElasticSearchService],
  exports: [ElasticsearchService, ElasticSearchService],
})
export class ElasticSearchModule {}

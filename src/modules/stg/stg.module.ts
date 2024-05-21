import { Module } from '@nestjs/common';
import { StgService } from './services/stg.service';
import { StgController } from './stg.controller';

@Module({
  controllers: [StgController],
  providers: [StgService],
})
export class StgModule {}

import { Module } from '@nestjs/common';
import { AiMlService } from './ai-ml.service';
import { AiMlController } from './ai-ml.controller';

@Module({
  controllers: [AiMlController],
  providers: [AiMlService],
})
export class AiMlModule {}

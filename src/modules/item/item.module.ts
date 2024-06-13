import { Module } from '@nestjs/common';

import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { DumpModule } from '../dump/dump.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DumpModule, UserModule],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}

import { Controller, Get, Query } from '@nestjs/common';

import { ItemService } from './item.service';
import { QueryItemDto } from './dto/get-item.dto';
import { ExtractUserId } from 'src/common/decorators/extract-userId';

@Controller({
  version: ['1'],
  path: 'item',
})
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  findOne(@ExtractUserId() userId: string, @Query() queryItemDto: QueryItemDto) {
    return this.itemService.findOne(queryItemDto, userId);
  }
}

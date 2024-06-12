import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ItemDumpService } from '../dump/service/item-dump.service';
import { UserService } from '../user/user.service';
import { QueryItemDto } from './dto/get-item.dto';
import { getSuccessResponse } from '../../utils/success-response.util';
import { HttpResponseMessage } from '../../common/constants/error-message';

@Injectable()
export class ItemService {
  private serverDefaultLanguage: string;
  constructor(
    private readonly itemDumpService: ItemDumpService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.serverDefaultLanguage = this.configService.get('serverDefaultLanguage');
  }
  async findOne(queryItemDto: QueryItemDto, userId: string) {
    const deviceInfo = (await this.userService.getDevicePreferenceById(queryItemDto.deviceId))?.data;
    const languageCode = deviceInfo?.languageCode || 'en';
    const item = await this.itemDumpService.findOneItem(queryItemDto.itemId, languageCode, userId);
    const itemListLength = item?.tags[0]?.list?.length;
    const itemTag = {
      level: {
        name:
          item?.tags?.[0]?.list?.[0]?.descriptor?.code == ('level' || 'learner-level')
            ? item?.tags?.[0]?.list?.[0]?.descriptor.name
            : 'Level',
        value: item?.tags?.[0]?.list?.[0]?.value || 'Beginner',
      },
      duration: {
        name:
          item?.tags[itemListLength - 1]?.list[itemListLength - 1]?.descriptor?.code == 'course-duration'
            ? item?.tags[itemListLength - 1]?.list[itemListLength - 1]?.descriptor?.name
            : 'Course duration',
        value: item?.tags[itemListLength - 1]?.list[itemListLength - 1]?.value || 'P20H',
      },
      list:
        item?.tags[0]?.list?.map((listObj) => {
          if (
            listObj?.descriptor?.code !== ('level' || 'learner-level') ||
            listObj?.descriptor?.code !== 'course-duration'
          ) {
            return listObj;
          }
        }) || [],
    };
    delete item?.tags;
    return getSuccessResponse({ ...item, itemTag }, HttpResponseMessage.OK);
  }
}

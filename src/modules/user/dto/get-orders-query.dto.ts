import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../../../common/constants/stg-constants';
export class GetOrdersQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus, {
    message: `Status should be one of these ${Object.keys(OrderStatus).values}`,
  })
  status: string;
  @IsOptional()
  page: number;
  @IsOptional()
  pageSize: number;
}

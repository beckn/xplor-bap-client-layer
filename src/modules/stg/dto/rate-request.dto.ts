import { IsEnum, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { RatingCategoryEnum } from 'src/common/constants/enums';

export class RateRequestDto {
  @IsNotEmpty({ message: 'transaction_id should not be empty' })
  @IsString({ message: ' transaction_id must be string' })
  transaction_id: string;

  @IsNotEmpty({ message: 'Order Id should not be empty' })
  @IsString({ message: 'Order Id must be a string' })
  order_id: string;

  @IsNotEmpty({ message: 'Rating should not be empty' })
  @IsString({ message: 'Rating category must be a string' })
  @IsEnum(RatingCategoryEnum)
  rating_category: RatingCategoryEnum;

  @IsNotEmpty({ message: 'Value should not be empty' })
  @IsString({ message: 'Value must be a string' })
  value: string;

  @IsNotEmpty({ message: 'Item Id should not be empty' })
  @IsString({ message: 'Item Id must be a string' })
  item_id: string;

  @IsNotEmpty({ message: 'domain should not be empty' })
  @IsString({ message: 'domain must be string' })
  domain: string;
}

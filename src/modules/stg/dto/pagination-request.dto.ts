import { IsNotEmpty } from 'class-validator';

export class PaginationRequestQuery {
  @IsNotEmpty({ message: 'page should not be empty' })
  page: number;

  @IsNotEmpty({ message: 'pageSize should not be empty' })
  pageSize: number;
}

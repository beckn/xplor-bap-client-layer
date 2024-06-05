import { IsOptional } from 'class-validator';

export class QueryUserProfile {
  @IsOptional()
  translate?: string;
}

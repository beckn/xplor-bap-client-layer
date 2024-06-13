import { IsOptional } from 'class-validator';

export enum ShareRequestAction {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
export class GetSharedVcRequestDto {
  @IsOptional()
  documentType?: string;

  @IsOptional()
  walletId: string;

  @IsOptional()
  status?: ShareRequestAction;

  @IsOptional()
  page: number;

  @IsOptional()
  pageSize: number;
}

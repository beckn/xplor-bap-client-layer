import { IsOptional } from 'class-validator';

export class UpdateSharedVcStatusQuery {
  @IsOptional()
  walletId?: string;

  @IsOptional()
  requestId?: string;

  @IsOptional()
  vcId?: string;

  @IsOptional()
  action?: string;
}

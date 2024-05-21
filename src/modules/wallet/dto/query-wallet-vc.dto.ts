import { IsOptional } from 'class-validator';

export class QueryWalletVcDto {
  @IsOptional()
  walletId: string;

  @IsOptional()
  vcId: string;
}
export class QueryWalletVcsDto {
  @IsOptional()
  walletId: string;

  @IsOptional()
  vcIds: string[];
}

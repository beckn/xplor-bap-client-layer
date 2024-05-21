import { IsOptional } from 'class-validator';

export class UpdateVcQueryRequestDto {
  @IsOptional()
  walletId?: string;

  @IsOptional()
  requestId?: string;
}

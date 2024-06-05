import { IsOptional } from 'class-validator';

export class Restrictions {
  @IsOptional()
  readonly expiresIn: number;

  @IsOptional()
  readonly viewOnce: boolean;
}
export class ShareVcRequestDto {
  @IsOptional()
  readonly certificateType: string;

  @IsOptional()
  readonly remarks: string;

  @IsOptional()
  readonly sharedWithEntity: string;

  @IsOptional()
  readonly restrictions: Restrictions;
}

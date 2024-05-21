import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class LoggerPayloadDto {
  @IsNotEmpty()
  message: any;
  @IsOptional()
  @IsString()
  methodName?: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

// DTO for creating a new provider, which includes id and name fields
export class ProviderDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

// Data Transfer Object (DTO) for updating user persona details
import { IsOptional } from 'class-validator';

export class PersonaDto {
  // Optional interest field, an array of strings
  @IsOptional()
  interest?: string[];

  // Optional choice field, an array of strings
  @IsOptional()
  choice?: string[];
}

/**
 * Data Transfer Object (DTO) for assigning roles to users.
 * Contains a single field, `roleId`, which is optional and represents the ID of the role to be assigned.
 */
import { IsOptional } from 'class-validator';
export class AssignRoleDto {
  @IsOptional()
  readonly roleId: string;
}

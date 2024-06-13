import { PartialType } from '@nestjs/mapped-types';

import { CreateEAuthDto } from './create-e-auth.dto';

/**
 * Data Transfer Object (DTO) for updating an e-auth record.
 * It extends the CreateEAuthDto to allow partial updates.
 */
export class UpdateEAuthDto extends PartialType(CreateEAuthDto) {}

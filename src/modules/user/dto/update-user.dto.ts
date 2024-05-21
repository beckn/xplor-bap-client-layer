// Importing PartialType from NestJS to create a DTO for updating user details
import { PartialType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';

// UpdateUserDto extends CreateUserDto, allowing partial updates of user details
export class UpdateUserDto extends PartialType(CreateUserDto) {}

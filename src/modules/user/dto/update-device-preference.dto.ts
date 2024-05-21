import { PartialType } from '@nestjs/swagger';
import { CreateDevicePreferenceDto } from './create-device-preference.dto';

export class UpdateDevicePreferenceDto extends PartialType(CreateDevicePreferenceDto) {}

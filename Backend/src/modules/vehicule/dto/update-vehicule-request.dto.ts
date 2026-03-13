import { PartialType } from '@nestjs/swagger';

import { CreateVehiculeRequestDto } from './create-vehicule-request.dto';

export class UpdateVehiculeRequestDto extends PartialType(CreateVehiculeRequestDto) {}

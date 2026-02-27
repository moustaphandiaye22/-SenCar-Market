import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { STATUT_VALIDATION_GARAGE_VALUES, StatutValidationGarage } from '../types/garage.types';

export class ValidationGarageRequestDto {
  @ApiProperty({ enum: STATUT_VALIDATION_GARAGE_VALUES })
  @IsEnum(STATUT_VALIDATION_GARAGE_VALUES)
  nouveauStatut!: StatutValidationGarage;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentaireAdmin?: string;
}

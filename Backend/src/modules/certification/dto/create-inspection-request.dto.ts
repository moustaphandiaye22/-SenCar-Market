import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import {
  ETAT_VEHICULE_INSPECTION_VALUES,
  EtatVehiculeInspection,
} from '../types/certification.types';

export class CreateInspectionRequestDto {
  @ApiProperty()
  @IsDateString()
  dateInspection!: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 2000000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2000000)
  kilometrage?: number;

  @ApiPropertyOptional({ enum: ETAT_VEHICULE_INSPECTION_VALUES })
  @IsOptional()
  @IsEnum(ETAT_VEHICULE_INSPECTION_VALUES)
  etatMoteur?: EtatVehiculeInspection;

  @ApiPropertyOptional({ enum: ETAT_VEHICULE_INSPECTION_VALUES })
  @IsOptional()
  @IsEnum(ETAT_VEHICULE_INSPECTION_VALUES)
  etatGenerateur?: EtatVehiculeInspection;

  @ApiPropertyOptional({ enum: ETAT_VEHICULE_INSPECTION_VALUES })
  @IsOptional()
  @IsEnum(ETAT_VEHICULE_INSPECTION_VALUES)
  etatFreinage?: EtatVehiculeInspection;

  @ApiPropertyOptional({ enum: ETAT_VEHICULE_INSPECTION_VALUES })
  @IsOptional()
  @IsEnum(ETAT_VEHICULE_INSPECTION_VALUES)
  etatSuspension?: EtatVehiculeInspection;

  @ApiPropertyOptional({ enum: ETAT_VEHICULE_INSPECTION_VALUES })
  @IsOptional()
  @IsEnum(ETAT_VEHICULE_INSPECTION_VALUES)
  etatTransmission?: EtatVehiculeInspection;

  @ApiPropertyOptional({ enum: ETAT_VEHICULE_INSPECTION_VALUES })
  @IsOptional()
  @IsEnum(ETAT_VEHICULE_INSPECTION_VALUES)
  etatPneus?: EtatVehiculeInspection;

  @ApiPropertyOptional({ enum: ETAT_VEHICULE_INSPECTION_VALUES })
  @IsOptional()
  @IsEnum(ETAT_VEHICULE_INSPECTION_VALUES)
  etatCarrosserie?: EtatVehiculeInspection;

  @ApiPropertyOptional({ enum: ETAT_VEHICULE_INSPECTION_VALUES })
  @IsOptional()
  @IsEnum(ETAT_VEHICULE_INSPECTION_VALUES)
  etatInterieur?: EtatVehiculeInspection;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentaire?: string;
}

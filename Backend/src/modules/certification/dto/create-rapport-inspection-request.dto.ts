import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { RESULTAT_INSPECTION_VALUES, ResultatInspection } from '../types/certification.types';

export class CreateRapportInspectionRequestDto {
  @ApiProperty({ enum: RESULTAT_INSPECTION_VALUES })
  @IsEnum(RESULTAT_INSPECTION_VALUES)
  resultat!: ResultatInspection;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  scoreGlobale?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conclusion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  estApprouve?: boolean;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { STATUT_TRADEIN_VALUES, StatutTradeIn } from '../types/tradein.types';

export class ValidationRequestDto {
  @ApiProperty({ enum: STATUT_TRADEIN_VALUES })
  @IsEnum(STATUT_TRADEIN_VALUES)
  nouveauStatut!: StatutTradeIn;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  prixPropose?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentaireAdmin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motifRejet?: string;
}

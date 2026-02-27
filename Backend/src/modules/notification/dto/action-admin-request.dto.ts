import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

import {
  STATUT_TRAITEMENT_SIGNALEMENT_VALUES,
  StatutTraitementSignalement,
} from '../types/notification.types';

export class ActionAdminRequestDto {
  @ApiProperty({ enum: STATUT_TRAITEMENT_SIGNALEMENT_VALUES })
  @IsEnum(STATUT_TRAITEMENT_SIGNALEMENT_VALUES)
  nouveauStatut!: StatutTraitementSignalement;

  @ApiProperty()
  @IsString()
  @Matches(/\S/, { message: 'actionAdmin ne doit pas être vide' })
  actionAdmin!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  adminId?: string;
}

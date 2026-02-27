import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

import {
  MOTIF_SIGNALEMENT_VALUES,
  MotifSignalement,
  TYPE_ENTITE_SIGNALABLE_VALUES,
  TypeEntiteSignalable,
} from '../types/notification.types';

export class CreateSignalementRequestDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  utilisateurId?: string;

  @ApiProperty({ enum: TYPE_ENTITE_SIGNALABLE_VALUES })
  @IsEnum(TYPE_ENTITE_SIGNALABLE_VALUES)
  typeEntite!: TypeEntiteSignalable;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  entiteId!: string;

  @ApiProperty({ enum: MOTIF_SIGNALEMENT_VALUES })
  @IsEnum(MOTIF_SIGNALEMENT_VALUES)
  motif!: MotifSignalement;

  @ApiProperty()
  @IsString()
  @Matches(/\S/, { message: 'description ne doit pas être vide' })
  description!: string;
}

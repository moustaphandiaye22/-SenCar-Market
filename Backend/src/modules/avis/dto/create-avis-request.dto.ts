import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

import { TYPE_AVIS_VALUES, TypeAvis } from '../types/avis.types';

export class CreateAvisRequestDto {
  @ApiProperty({ enum: TYPE_AVIS_VALUES })
  @IsEnum(TYPE_AVIS_VALUES)
  typeAvis!: TypeAvis;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  transactionId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  cibleUtilisateurId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  vehiculeId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  garageId?: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  note!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commentaire?: string;
}

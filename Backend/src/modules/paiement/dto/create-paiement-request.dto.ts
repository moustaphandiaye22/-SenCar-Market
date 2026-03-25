import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

import { TYPE_PAIEMENT_VALUES, TypePaiement } from '../types/paiement.types';

export class CreatePaiementRequestDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  utilisateurId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID de la réservation (optionnel pour recharge portefeuille)' })
  @IsOptional()
  @IsUUID()
  reservationId?: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0.01)
  montant!: number;

  @ApiProperty({ enum: TYPE_PAIEMENT_VALUES })
  @IsEnum(TYPE_PAIEMENT_VALUES)
  methodePaiement!: TypePaiement;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '770000000' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEscrow?: boolean;

  @ApiPropertyOptional({ example: 1250 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  commissionEscrow?: number;
}

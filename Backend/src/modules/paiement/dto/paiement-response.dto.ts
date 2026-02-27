import { ApiProperty } from '@nestjs/swagger';

import { StatutPaiement, TypePaiement } from '../types/paiement.types';

export class PaiementResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  utilisateurId!: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  reservationId!: string | null;

  @ApiProperty({ nullable: true })
  montant!: string | null;

  @ApiProperty({ nullable: true })
  montantEscrow!: string | null;

  @ApiProperty({ nullable: true })
  commission!: string | null;

  @ApiProperty({ enum: ['EN_ATTENTE', 'EN_COURS', 'CONFIRME', 'ECHOUE', 'REMBOURSE', 'ANNULE'], nullable: true })
  statut!: StatutPaiement | null;

  @ApiProperty({ enum: ['WAVE', 'ORANGE_MONEY', 'FREE_MONEY', 'CARTE_BANCAIRE', 'ESCROW'], nullable: true })
  methodePaiement!: TypePaiement | null;

  @ApiProperty({ nullable: true })
  datePaiement!: Date | null;

  @ApiProperty({ nullable: true })
  referenceTransaction!: string | null;

  @ApiProperty({ nullable: true })
  referenceExterne!: string | null;

  @ApiProperty({ nullable: true })
  urlPaiement!: string | null;

  @ApiProperty({ nullable: true })
  isEscrow!: boolean | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true })
  updatedAt!: Date | null;
}

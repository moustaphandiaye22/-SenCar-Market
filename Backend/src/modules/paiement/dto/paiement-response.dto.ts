import { ApiProperty } from '@nestjs/swagger';

import { StatutPaiement, TypePaiement } from '../types/paiement.types';

export class PaiementResponseDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ type: String, format: 'uuid', nullable: true, example: '550e8400-e29b-41d4-a716-446655440001' })
  utilisateurId!: string | null;

  @ApiProperty({ type: String, format: 'uuid', nullable: true, example: '550e8400-e29b-41d4-a716-446655440002' })
  reservationId!: string | null;

  @ApiProperty({ type: String, nullable: true, example: '25000.00' })
  montant!: string | null;

  @ApiProperty({ type: String, nullable: true, example: '23750.00' })
  montantEscrow!: string | null;

  @ApiProperty({ type: String, nullable: true, example: '1250.00' })
  commission!: string | null;

  @ApiProperty({ enum: ['EN_ATTENTE', 'EN_COURS', 'CONFIRME', 'ECHOUE', 'REMBOURSE', 'ANNULE'], nullable: true })
  statut!: StatutPaiement | null;

  @ApiProperty({ enum: ['WAVE', 'ORANGE_MONEY', 'FREE_MONEY', 'CARTE_BANCAIRE', 'ESCROW'], nullable: true })
  methodePaiement!: TypePaiement | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time', example: '2026-02-28T10:30:00.000Z' })
  datePaiement!: Date | null;

  @ApiProperty({ type: String, nullable: true, example: 'TRX_ABC123456' })
  referenceTransaction!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'WAVE_20260228_001' })
  referenceExterne!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'https://wave.com/pay/ab12cd34' })
  urlPaiement!: string | null;

  @ApiProperty({ type: Boolean, nullable: true, example: true })
  isEscrow!: boolean | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time', example: '2026-02-28T10:20:00.000Z' })
  createdAt!: Date | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time', example: '2026-02-28T10:25:00.000Z' })
  updatedAt!: Date | null;
}

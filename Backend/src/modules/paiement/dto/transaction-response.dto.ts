import { ApiProperty } from '@nestjs/swagger';

import { StatutTransaction, TypeTransaction } from '../types/paiement.types';

export class TransactionResponseDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440010' })
  id!: string;

  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440011' })
  portefeuilleId!: string;

  @ApiProperty({ format: 'uuid', nullable: true, example: '550e8400-e29b-41d4-a716-446655440012' })
  utilisateurId!: string | null;

  @ApiProperty({ example: '10000.00' })
  montant!: string;

  @ApiProperty({ enum: ['CREDIT', 'DEBIT', 'RETRAIT', 'REMBOURSEMENT', 'COMMISSION', 'ESCROW_DEPOSIT', 'ESCROW_RELEASE', 'ESCROW_REFUND'] })
  typeTransaction!: TypeTransaction;

  @ApiProperty({ enum: ['EN_ATTENTE', 'EN_COURS', 'CONFIRMEE', 'ECHOUEE', 'ANNULEE'] })
  statut!: StatutTransaction;

  @ApiProperty({ type: String, nullable: true, example: 'Retrait Orange Money' })
  description!: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'OM_20260228_9898' })
  referenceExterne!: string | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time', example: '2026-02-28T11:00:00.000Z' })
  dateTransaction!: Date | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time', example: '2026-02-28T11:00:00.000Z' })
  createdAt!: Date | null;
}

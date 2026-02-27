import { ApiProperty } from '@nestjs/swagger';

import { StatutTransaction, TypeTransaction } from '../types/paiement.types';

export class TransactionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  portefeuilleId!: string;

  @ApiProperty()
  montant!: string;

  @ApiProperty({ enum: ['CREDIT', 'DEBIT', 'RETRAIT', 'REMBOURSEMENT', 'COMMISSION', 'ESCROW_DEPOSIT', 'ESCROW_RELEASE', 'ESCROW_REFUND'] })
  typeTransaction!: TypeTransaction;

  @ApiProperty({ enum: ['EN_ATTENTE', 'EN_COURS', 'CONFIRMEE', 'ECHOUEE', 'ANNULEE'] })
  statut!: StatutTransaction;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  referenceExterne!: string | null;

  @ApiProperty({ nullable: true })
  dateTransaction!: Date | null;

  @ApiProperty({ nullable: true })
  createdAt!: Date | null;
}

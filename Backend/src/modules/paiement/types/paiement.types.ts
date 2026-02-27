export const TYPE_PAIEMENT_VALUES = ['WAVE', 'ORANGE_MONEY', 'FREE_MONEY', 'CARTE_BANCAIRE', 'ESCROW'] as const;
export type TypePaiement = (typeof TYPE_PAIEMENT_VALUES)[number];

export const STATUT_PAIEMENT_VALUES = ['EN_ATTENTE', 'EN_COURS', 'CONFIRME', 'ECHOUE', 'REMBOURSE', 'ANNULE'] as const;
export type StatutPaiement = (typeof STATUT_PAIEMENT_VALUES)[number];

export const TYPE_TRANSACTION_VALUES = [
  'CREDIT',
  'DEBIT',
  'RETRAIT',
  'REMBOURSEMENT',
  'COMMISSION',
  'ESCROW_DEPOSIT',
  'ESCROW_RELEASE',
  'ESCROW_REFUND',
] as const;
export type TypeTransaction = (typeof TYPE_TRANSACTION_VALUES)[number];

export const STATUT_TRANSACTION_VALUES = ['EN_ATTENTE', 'EN_COURS', 'CONFIRMEE', 'ECHOUEE', 'ANNULEE'] as const;
export type StatutTransaction = (typeof STATUT_TRANSACTION_VALUES)[number];

export const TYPE_ASSURANCE_VALUES = [
  'RESPONSABILITE_CIVILE',
  'TOUS_RISQUES',
  'VOL',
  'INCENDIE',
  'BRIS_DE_GLACE',
  'ASSISTANCE',
  'PROTECTION_JURIDIQUE',
] as const;
export type TypeAssurance = (typeof TYPE_ASSURANCE_VALUES)[number];

export const STATUT_ASSURANCE_VALUES = ['ACTIVE', 'EXPIREE', 'ANNULEE', 'EN_ATTENTE', 'SUSPENDUE', 'PAYEE'] as const;
export type StatutAssurance = (typeof STATUT_ASSURANCE_VALUES)[number];

export const STATUT_VALIDATION_GARAGE_VALUES = ['EN_ATTENTE', 'ACTIF', 'SUSPENDU', 'REJET'] as const;
export type StatutValidationGarage = (typeof STATUT_VALIDATION_GARAGE_VALUES)[number];

export const CATEGORIE_SERVICE_GARAGE_VALUES = [
  'ENTRETIEN',
  'REPARATION',
  'DIAGNOSTIC',
  'CARROSSERIE',
  'AUTRE',
] as const;
export type CategorieServiceGarage = (typeof CATEGORIE_SERVICE_GARAGE_VALUES)[number];

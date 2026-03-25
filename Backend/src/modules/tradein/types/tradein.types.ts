export const STATUT_TRADEIN_VALUES = [
  'EN_ATTENTE',
  'EN_ANALYSE', // Alias for EN_COURS_EVALUATION (used in frontend)
  'EN_COURS_EVALUATION',
  'EVALUATION_TERMINEE',
  'OFFRE_PROPOSEE',
  'ACCEPTE',
  'REFUSE', // Alias for REJETEE (used in frontend)
  'REJETEE',
  'ANNULEE',
] as const;
export type StatutTradeIn = (typeof STATUT_TRADEIN_VALUES)[number];

export const ETAT_VEHICULE_VALUES = ['excellent', 'bon', 'moyen', 'mauvais'] as const;
export type EtatVehicule = (typeof ETAT_VEHICULE_VALUES)[number];

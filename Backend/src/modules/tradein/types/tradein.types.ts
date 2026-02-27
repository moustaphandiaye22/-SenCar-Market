export const STATUT_TRADEIN_VALUES = [
  'EN_ATTENTE',
  'EN_COURS_EVALUATION',
  'EVALUATION_TERMINEE',
  'ACCEPTE',
  'REJETEE',
  'ANNULEE',
] as const;
export type StatutTradeIn = (typeof STATUT_TRADEIN_VALUES)[number];

export const ETAT_VEHICULE_VALUES = ['excellent', 'bon', 'moyen', 'mauvais'] as const;
export type EtatVehicule = (typeof ETAT_VEHICULE_VALUES)[number];

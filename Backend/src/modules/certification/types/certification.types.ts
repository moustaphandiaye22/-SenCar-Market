export const STATUT_DEMANDE_CERTIFICATION_VALUES = [
  'EN_ATTENTE',
  'PAYEE',
  'INSPECTION_PROGRAMMEE',
  'INSPECTE',
  'CERTIFIEE',
  'REJETEE',
] as const;
export type StatutDemandeCertification = (typeof STATUT_DEMANDE_CERTIFICATION_VALUES)[number];

export const RESULTAT_INSPECTION_VALUES = ['EN_COURS', 'REUSSI', 'ECHEC', 'A_REVISER'] as const;
export type ResultatInspection = (typeof RESULTAT_INSPECTION_VALUES)[number];

export const ETAT_VEHICULE_INSPECTION_VALUES = ['BON', 'MOYEN', 'MAUVAIS', 'NON_VERIFIE'] as const;
export type EtatVehiculeInspection = (typeof ETAT_VEHICULE_INSPECTION_VALUES)[number];

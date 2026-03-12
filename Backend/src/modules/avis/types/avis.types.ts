export const TYPE_AVIS_VALUES = [
  'ACHAT_VEHICULE',
  'LOCATION_VEHICULE',
  'SERVICE_GARAGE',
  'UTILISATEUR',
] as const;
export type TypeAvis = (typeof TYPE_AVIS_VALUES)[number];

export const STATUT_AVIS_VALUES = ['EN_ATTENTE', 'PUBLIE', 'SIGNALEE', 'SUPPRIMEE'] as const;
export type StatutAvis = (typeof STATUT_AVIS_VALUES)[number];

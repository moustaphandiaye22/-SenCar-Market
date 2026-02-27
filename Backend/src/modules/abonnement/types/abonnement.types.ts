export const TYPE_ABONNEMENT_VALUES = ['BASIC', 'PREMIUM', 'PROFESSIONNEL', 'ENTREPRISE'] as const;
export type TypeAbonnement = (typeof TYPE_ABONNEMENT_VALUES)[number];

export const STATUT_ABONNEMENT_VALUES = ['ACTIF', 'EXPIRE', 'ANNULE', 'EN_ATTENTE'] as const;
export type StatutAbonnement = (typeof STATUT_ABONNEMENT_VALUES)[number];

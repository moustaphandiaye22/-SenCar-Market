// Insurance types from Backend Prisma Schema
export enum TypeAssurance {
  RESPONSABILITE_CIVILE = 'RESPONSABILITE_CIVILE',
  TOUS_RISQUES = 'TOUS_RISQUES',
  VOL = 'VOL',
  INCENDIE = 'INCENDIE',
  BRIS_DE_GLACE = 'BRIS_DE_GLACE',
  ASSISTANCE = 'ASSISTANCE',
  PROTECTION_JURIDIQUE = 'PROTECTION_JURIDIQUE',
}

// Human-readable labels for TypeAssurance
export const TypeAssuranceLabels: Record<TypeAssurance, string> = {
  [TypeAssurance.RESPONSABILITE_CIVILE]: 'Responsabilité Civile',
  [TypeAssurance.TOUS_RISQUES]: 'Tous Risques',
  [TypeAssurance.VOL]: 'Vol',
  [TypeAssurance.INCENDIE]: 'Incendie',
  [TypeAssurance.BRIS_DE_GLACE]: 'Bris de Glace',
  [TypeAssurance.ASSISTANCE]: 'Assistance',
  [TypeAssurance.PROTECTION_JURIDIQUE]: 'Protection Juridique',
};

// Subscription types from Backend Prisma Schema
export enum TypeAbonnement {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  PROFESSIONNEL = 'PROFESSIONNEL',
  ENTREPRISE = 'ENTREPRISE',
}

// Human-readable labels for TypeAbonnement
export const TypeAbonnementLabels: Record<TypeAbonnement, string> = {
  [TypeAbonnement.BASIC]: 'Basique',
  [TypeAbonnement.PREMIUM]: 'Premium',
  [TypeAbonnement.PROFESSIONNEL]: 'Professionnel',
  [TypeAbonnement.ENTREPRISE]: 'Entreprise',
};

export type AdminUserRecord = {
  id: string;
  email: string;
  telephone: string;
  prenom: string | null;
  nom: string | null;
  photoProfilUrl: string | null;
  emailVerifie: boolean | null;
  telephoneVerifie: boolean | null;
  doubleAuthActive: boolean | null;
  statutVerification: string | null;
  createdAt: Date | null;
  deletedAt: Date | null;
  typeUtilisateurId: string | null;
  typeUtilisateur: { id: string; nom: string } | null;
};

export type VehiculeRecord = {
  id: string;
  proprietaireId: string;
  statut: string;
  marque: { nom: string | null } | null;
  modele: { nom: string | null } | null;
  carburant: { nom: string | null } | null;
  boiteVitesse: { nom: string | null } | null;
  proprietaire: { id: string; nom: string | null };
  photos: Array<{ url: string }>;
  anneeFabrication: number | null;
  kilometrage: number | null;
  couleur: string | null;
  prixVente: unknown;
  description: string | null;
  numeroVin: string | null;
  immatriculation: string | null;
  prixNegociable: boolean | null;
  certifie: boolean | null;
  estBoost: boolean | null;
  boostDebut: Date | null;
  boostFin: Date | null;
  vues: number | null;
  nombreFavoris: number | null;
  createdAt: Date | null;
};

export type TransactionRecord = {
  id: string;
  portefeuilleId: string;
  montant: unknown;
  typeTransaction: string;
  statut: string;
  description: string | null;
  referenceExterne: string | null;
  dateTransaction: Date | null;
  createdAt: Date | null;
  portefeuille: { utilisateurId: string } | null;
};

export type CreateVehiculeInput = {
  id: string;
  proprietaire: { connect: { id: string } };
  marque: { connect: { id: string } };
  modele: { connect: { id: string } };
  anneeFabrication: number;
  kilometrage: number;
  carburant: { connect: { id: string } };
  boiteVitesse: { connect: { id: string } };
  couleur: string;
  prixVente: number;
  description?: string;
  numeroVin: string;
  immatriculation?: string;
  prixNegociable: boolean;
  certifie: boolean;
  statut: string;
  estBoost: boolean;
  vues: number;
  nombreFavoris: number;
};

export type CreateVehiculePhotoInput = {
  id: string;
  vehicule: { connect: { id: string } };
  url: string;
  estPrincipale: boolean;
  ordre: number;
};

export type UpdateVehiculeInput = Partial<{
  vues: number;
  statut: string;
  estBoost: boolean;
  boostDebut: Date;
  boostFin: Date;
  nombreFavoris: number;
}>;

export type VehiculeOwnerRecord = { id: string; nom: string | null };
export type SimpleNamedRecord = { id: string; nom: string | null };
export type VehiculePhotoRecord = { url: string };

export type VehiculeRecord = {
  id: string;
  proprietaireId: string;
  anneeFabrication: number | null;
  kilometrage: number | null;
  couleur: string | null;
  prixVente: unknown;
  description: string | null;
  numeroVin: string | null;
  immatriculation: string | null;
  statut: string;
  prixNegociable: boolean | null;
  certifie: boolean | null;
  estBoost: boolean | null;
  boostDebut: Date | null;
  boostFin: Date | null;
  vues: number | null;
  nombreFavoris: number | null;
  createdAt: Date | null;
  marque: SimpleNamedRecord | null;
  modele: SimpleNamedRecord | null;
  carburant: SimpleNamedRecord | null;
  boiteVitesse: SimpleNamedRecord | null;
  proprietaire: VehiculeOwnerRecord;
  photos: VehiculePhotoRecord[];
};

export type VehiculeFavoriRecord = {
  vehicule: VehiculeRecord;
};

export type UserWithRoleRecord = {
  id: string;
  email: string;
  typeUtilisateur: { nom: string } | null;
};

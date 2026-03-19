export type CreateVehiculeInput = {
  id: string;
  proprietaire_id: string;
  marque_id?: string;
  modele_id?: string;
  annee_fabrication?: number;
  kilometrage?: number;
  carburant_id?: string;
  boite_vitesse_id?: string;
  couleur?: string;
  prix_vente?: number;
  description?: string;
  numero_vin?: string;
  immatriculation?: string;
  prix_negociable?: boolean;
  certifie?: boolean;
  statut: string;
  est_boost?: boolean;
  vues?: number;
  nombre_favoris?: number;
  titre?: string;
  nombre_portes?: number;
  nombre_places?: number;
  cylindree?: string;
  puissance_fiscale?: string;
  est_garantie?: boolean;
  garantie_mois?: number;
};

export type CreateVehiculePhotoInput = {
  id: string;
  vehicule_id: string;
  url: string;
  est_principale?: boolean;
  ordre?: number;
};

export type UpdateVehiculeInput = Partial<{
  marque_id: string;
  modele_id: string;
  annee_fabrication: number;
  kilometrage: number;
  carburant_id: string;
  boite_vitesse_id: string;
  couleur: string;
  prix_vente: number;
  description: string;
  numero_vin: string;
  immatriculation: string;
  prix_negociable: boolean;
  certifie: boolean;
  statut: string;
  est_boost: boolean;
  boost_debut: Date;
  boost_fin: Date;
  vues: number;
  nombre_favoris: number;
  titre: string;
  nombre_portes: number;
  nombre_places: number;
  cylindree: string;
  puissance_fiscale: string;
  est_garantie: boolean;
  garantie_mois: number;
}>;

export type VehiculeOwnerRecord = { id: string; nom: string | null; email: string; telephone: string };
export type SimpleNamedRecord = { id: string; nom: string | null };
export type VehiculePhotoRecord = { url: string };

export type VehiculeRecord = {
  id: string;
  proprietaire_id: string;
  marque_id: string | null;
  modele_id: string | null;
  carburant_id: string | null;
  boite_vitesse_id: string | null;
  annee_fabrication: number | null;
  kilometrage: number | null;
  couleur: string | null;
  prix_vente: unknown;
  description: string | null;
  numero_vin: string | null;
  immatriculation: string | null;
  statut: string;
  prix_negociable: boolean | null;
  certifie: boolean | null;
  est_boost: boolean | null;
  boost_debut: Date | null;
  boost_fin: Date | null;
  vues: number | null;
  nombre_favoris: number | null;
  titre: string | null;
  nombre_portes: number | null;
  nombre_places: number | null;
  cylindree: string | null;
  puissance_fiscale: string | null;
  est_garantie: boolean | null;
  garantie_mois: number | null;
  created_at: Date | null;
  marque: SimpleNamedRecord | null;
  modele: SimpleNamedRecord | null;
  carburant: SimpleNamedRecord | null;
  boite_vitesse: SimpleNamedRecord | null;
  utilisateur: VehiculeOwnerRecord;
  photo_vehicule: VehiculePhotoRecord[];
};

export type VehiculeFavoriRecord = {
  vehicule: VehiculeRecord;
};

export type UserWithRoleRecord = {
  id: string;
  email: string;
  type_utilisateur: { nom: string } | null;
};

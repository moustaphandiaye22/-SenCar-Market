export interface Garage {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string | null;
  description: string | null;
  horairesOuverture: string | null;
  logoUrl: string | null;
  ville: string | null;
  pays: string | null;
  latitude: number | null;
  longitude: number | null;
  statutValidation: string | null;
  commentaireAdmin: string | null;
  dateValidation: string | null;
  proprietaireId: string | null;
  proprietaireNom: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  noteMoyenne: number | null;
  nombreAvis: number | null;
}

export interface ServiceGarage {
  id: string;
  nom: string;
  description?: string | null;
  prix?: string | number | null;
  dureeEstimee?: number | null;
  categorie?: string | null;
  actif: boolean;
}

export interface GarageServiceAssociation {
  id: string;
  garageId: string;
  garageNom?: string | null;
  serviceId: string;
  serviceNom?: string | null;
  prix?: number | null;
  dureeEstimee?: number | null;
  actif: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

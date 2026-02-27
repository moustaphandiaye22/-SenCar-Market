import { StatutValidationGarage } from './types/garage.types';

type ConnectById = { connect: { id: string } };

export type UserRole = { nom: string | null };
export type UserRecord = {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  typeUtilisateur: UserRole | null;
};

export type GarageRecord = {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string | null;
  description: string | null;
  horairesOuverture: string | null;
  latitude: number | null;
  longitude: number | null;
  ville: string | null;
  pays: string | null;
  logoUrl: string | null;
  statutValidation: string | null;
  commentaireAdmin: string | null;
  dateValidation: Date | null;
  utilisateurId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  proprietaire: { id: string; nom: string | null } | null;
};

export type ServiceGarageRecord = {
  id: string;
  nom: string;
  description: string | null;
  prix: unknown;
  dureeEstimee: number | null;
  categorie: string | null;
  actif: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type GarageServiceAssociationRecord = {
  id: string;
  garageId: string;
  serviceId: string;
  prix: unknown;
  dureeEstimee: number | null;
  actif: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  garage: { id: string; nom: string };
  service: { id: string; nom: string };
};

export type CreateGarageInput = {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email?: string;
  description?: string;
  horairesOuverture?: string;
  latitude?: number;
  longitude?: number;
  ville: string;
  pays?: string;
  logoUrl?: string;
  statutValidation: string;
  proprietaire: ConnectById;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateGarageInput = Partial<{
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  description: string;
  horairesOuverture: string;
  latitude: number;
  longitude: number;
  ville: string;
  pays: string;
  logoUrl: string;
  statutValidation: string;
  commentaireAdmin: string;
  dateValidation: Date;
  updatedAt: Date;
}>;

export type CreateServiceInput = {
  id: string;
  nom: string;
  description?: string;
  prix?: number;
  dureeEstimee?: number;
  categorie?: string;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateGarageServiceAssociationInput = {
  id: string;
  garage: ConnectById;
  service: ConnectById;
  prix?: number;
  dureeEstimee?: number;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
};

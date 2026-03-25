import type { StatutValidationGarage, CategorieServiceGarage } from './types/garage.types';

type ConnectById = { connect: { id: string } };

export type UserRole = { nom: string | null };
export type UserRecord = {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  type_utilisateur: UserRole | null;
};

export type GarageRecord = {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string | null;
  description: string | null;
  horaires_ouverture: string | null;
  latitude: number | null;
  longitude: number | null;
  ville: string | null;
  pays: string | null;
  logo_url: string | null;
  statut_validation: string | null;
  commentaire_admin: string | null;
  date_validation: Date | null;
  utilisateur_id: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  utilisateur: { id: string; nom: string | null } | null;
};

export type ServiceGarageRecord = {
  id: string;
  nom: string;
  description: string | null;
  prix: unknown;
  duree_estimee: number | null;
  categorie: string | null;
  actif: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type GarageServiceAssociationRecord = {
  id: string;
  garage_id: string;
  service_id: string;
  prix: unknown;
  duree_estimee: number | null;
  actif: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
  garage: { id: string; nom: string };
  service_garage: { id: string; nom: string };
};

export type CreateGarageInput = {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email?: string;
  description?: string;
  horaires_ouverture?: string;
  latitude?: number;
  longitude?: number;
  ville: string;
  pays?: string;
  logo_url?: string;
  statut_validation: StatutValidationGarage;
  utilisateur_id: string;
  created_at: Date;
  updated_at: Date;
};

export type UpdateGarageInput = Partial<{
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  description: string;
  horaires_ouverture: string;
  latitude: number;
  longitude: number;
  ville: string;
  pays: string;
  logo_url: string;
  statut_validation: StatutValidationGarage;
  commentaire_admin: string;
  date_validation: Date;
  updated_at: Date;
}>;

export type CreateServiceInput = {
  id: string;
  nom: string;
  description?: string;
  prix?: number;
  duree_estimee?: number;
  categorie?: CategorieServiceGarage;
  actif: boolean;
  created_at: Date;
  updated_at: Date;
};

export type CreateGarageServiceAssociationInput = {
  id: string;
  garage: ConnectById;
  service_garage: ConnectById;
  prix?: number;
  duree_estimee?: number;
  actif: boolean;
  created_at: Date;
  updated_at: Date;
};

export type RendezVousServiceRecord = {
  id: string;
  garage_id: string;
  client_id: string;
  service_id: string | null;
  date_rendez_vous: Date;
  statut: string | null;
  commentaire: string | null;
  created_at: Date;
  updated_at: Date;
  garage: { id: string; nom: string; utilisateur_id: string | null };
  client: { id: string; nom: string | null; prenom: string | null; email: string };
  service: { id: string; nom: string } | null;
};

export type CreateRendezVousInput = {
  id: string;
  garage: { connect: { id: string } };
  client: { connect: { id: string } };
  service?: { connect: { id: string } };
  date_rendez_vous: Date;
  statut: any;
  commentaire?: string;
  created_at: Date;
  updated_at: Date;
};

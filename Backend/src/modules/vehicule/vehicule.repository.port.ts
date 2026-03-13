import type {
  CreateVehiculeInput,
  CreateVehiculePhotoInput,
  UpdateVehiculeInput,
  UserWithRoleRecord,
  VehiculeFavoriRecord,
  VehiculePhotoRecord,
  VehiculeRecord,
} from './vehicule.models';

export const VEHICULE_REPOSITORY_PORT = Symbol('VEHICULE_REPOSITORY_PORT');

export interface VehiculeRepositoryPort {
  findUserByEmail(email: string): Promise<UserWithRoleRecord | null>;
  findVehiculeById(id: string): Promise<VehiculeRecord | null>;

  findMarqueById(id: string): Promise<{ id: string } | null>;
  findModeleById(id: string): Promise<{ id: string } | null>;
  findOrCreateMarque(nom: string): Promise<{ id: string }>;
  findOrCreateModele(marqueId: string, nom: string): Promise<{ id: string }>;
  findCarburantById(id: string): Promise<{ id: string } | null>;
  findBoiteVitesseById(id: string): Promise<{ id: string } | null>;

  findAllMarques(): Promise<{ id: string; nom: string }[]>;
  findModelesByMarque(marqueId: string): Promise<{ id: string; nom: string }[]>;
  findAllCarburants(): Promise<{ id: string; nom: string }[]>;
  findAllBoiteVitesses(): Promise<{ id: string; nom: string }[]>;

  createVehicule(data: CreateVehiculeInput): Promise<VehiculeRecord>;
  createPhoto(data: CreateVehiculePhotoInput): Promise<VehiculePhotoRecord>;

  findPublishedPaged(params: {
    skip: number;
    take: number;
    orderBy: Record<string, 'asc' | 'desc'>;
    marqueId?: string;
    modeleId?: string;
    q?: string;
  }): Promise<{ total: number; items: VehiculeRecord[] }>;

  findByProprietaireId(proprietaireId: string): Promise<VehiculeRecord[]>;
  updateVehicule(id: string, data: UpdateVehiculeInput): Promise<VehiculeRecord>;
  deleteVehicule(id: string): Promise<{ id: string }>;

  existsFavori(utilisateurId: string, vehiculeId: string): Promise<{ id: string } | null>;
  createFavori(utilisateurId: string, vehiculeId: string): Promise<{ id: string }>;
  deleteFavori(utilisateurId: string, vehiculeId: string): Promise<{ count: number }>;
  findFavorisByUtilisateur(utilisateurId: string): Promise<VehiculeFavoriRecord[]>;
  isFavori(utilisateurId: string, vehiculeId: string): Promise<{ id: string } | null>;
  countFavoris(vehiculeId: string): Promise<number>;
}

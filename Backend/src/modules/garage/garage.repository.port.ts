import type {
  CreateGarageInput,
  CreateGarageServiceAssociationInput,
  CreateServiceInput,
  GarageRecord,
  GarageServiceAssociationRecord,
  ServiceGarageRecord,
  UpdateGarageInput,
  UserRecord,
  CreateRendezVousInput,
  RendezVousServiceRecord,
} from './garage.models';
import type { StatutValidationGarage } from './types/garage.types';

export const GARAGE_REPOSITORY_PORT = Symbol('GARAGE_REPOSITORY_PORT');

export interface GarageRepositoryPort {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;

  createGarage(data: CreateGarageInput): Promise<GarageRecord>;
  updateGarage(id: string, data: UpdateGarageInput): Promise<GarageRecord>;
  findGarageById(id: string): Promise<GarageRecord | null>;
  deleteGarage(id: string): Promise<GarageRecord>;
  findGaragesPaged(page: number, size: number): Promise<{ items: GarageRecord[]; total: number }>;
  findGaragesByStatutPaged(
    statut: StatutValidationGarage,
    page: number,
    size: number,
  ): Promise<{ items: GarageRecord[]; total: number }>;
  findGaragesByProprietaireId(proprietaireId: string): Promise<GarageRecord[]>;
  findActiveByVille(ville: string): Promise<GarageRecord[]>;
  findByLocation(minLat: number, maxLat: number, minLon: number, maxLon: number): Promise<GarageRecord[]>;
  searchGarages(query: string): Promise<GarageRecord[]>;

  createService(data: CreateServiceInput): Promise<ServiceGarageRecord>;
  findServiceById(id: string): Promise<ServiceGarageRecord | null>;
  findServicesActifs(): Promise<ServiceGarageRecord[]>;

  findAssociationByGarageAndService(
    garageId: string,
    serviceId: string,
  ): Promise<GarageServiceAssociationRecord | null>;
  createAssociation(data: CreateGarageServiceAssociationInput): Promise<GarageServiceAssociationRecord>;
  findServicesByGarageId(garageId: string): Promise<GarageServiceAssociationRecord[]>;
  findAssociationsByGarageId(garageId: string): Promise<Array<{ id: string }>>;
  deleteAssociation(id: string): Promise<void>;
  deleteManyAssociations(ids: string[]): Promise<void>;

  createRendezVous(data: CreateRendezVousInput): Promise<RendezVousServiceRecord>;
  findRendezVousById(id: string): Promise<RendezVousServiceRecord | null>;
  findRendezVousByClient(clientId: string): Promise<RendezVousServiceRecord[]>;
  findRendezVousByGarage(garageId: string): Promise<RendezVousServiceRecord[]>;
  updateRendezVousStatut(id: string, statut: string): Promise<RendezVousServiceRecord>;

  newId(): string;
}

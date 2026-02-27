import type {
  CreateDemandeInput,
  CreateHistoriqueEstimationInput,
  CreateNotificationInput,
  DemandeRecord,
  UpdateDemandeInput,
  UserRecord,
  VehiculeMini,
} from './tradein.models';

export const TRADEIN_REPOSITORY_PORT = Symbol('TRADEIN_REPOSITORY_PORT');

export interface TradeInRepositoryPort {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  findVehiculeById(id: string): Promise<VehiculeMini | null>;

  createDemande(data: CreateDemandeInput): Promise<DemandeRecord>;
  findDemandeById(id: string): Promise<DemandeRecord | null>;
  findDemandesPaged(page: number, size: number): Promise<{ items: DemandeRecord[]; total: number }>;
  findDemandesByUtilisateurId(utilisateurId: string): Promise<DemandeRecord[]>;
  findDemandesByNotifie(estNotifie: boolean): Promise<DemandeRecord[]>;
  updateDemande(id: string, data: UpdateDemandeInput): Promise<DemandeRecord>;
  deleteDemande(id: string): Promise<DemandeRecord>;

  createHistoriqueEstimation(data: CreateHistoriqueEstimationInput): Promise<{ id: string }>;
  createNotification(data: CreateNotificationInput): Promise<{ id: string }>;

  newId(): string;
}

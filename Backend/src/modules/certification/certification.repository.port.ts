import type {
  CreateDemandeInput,
  CreateInspectionInput,
  CreateRapportInput,
  DemandeRecord,
  InspectionRecord,
  RapportRecord,
  UpdateDemandeInput,
  UpdateInspectionInput,
  UpdateRapportInput,
  UserRecord,
  VehiculeMini,
} from './certification.models';

export const CERTIFICATION_REPOSITORY_PORT = Symbol('CERTIFICATION_REPOSITORY_PORT');

export interface CertificationRepositoryPort {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  findVehiculeById(id: string): Promise<VehiculeMini | null>;

  createDemande(data: CreateDemandeInput): Promise<DemandeRecord>;
  findDemandeById(id: string): Promise<DemandeRecord | null>;
  findDemandesByVehiculeId(vehiculeId: string): Promise<DemandeRecord[]>;
  findDemandesPaged(page: number, size: number): Promise<{ items: DemandeRecord[]; total: number }>;
  findDemandesByUtilisateurId(utilisateurId: string): Promise<DemandeRecord[]>;
  updateDemande(id: string, data: UpdateDemandeInput): Promise<DemandeRecord>;
  deleteDemande(id: string): Promise<DemandeRecord>;

  createInspection(data: CreateInspectionInput): Promise<InspectionRecord>;
  findInspectionById(id: string): Promise<InspectionRecord | null>;
  findInspectionsByInspecteurPaged(
    inspecteurId: string,
    page: number,
    size: number,
  ): Promise<{ items: InspectionRecord[]; total: number }>;
  updateInspection(id: string, data: UpdateInspectionInput): Promise<InspectionRecord>;
  deleteInspection(id: string): Promise<InspectionRecord>;

  findRapportByInspectionId(inspectionId: string): Promise<RapportRecord | null>;
  createRapport(data: CreateRapportInput): Promise<RapportRecord>;
  updateRapport(id: string, data: UpdateRapportInput): Promise<RapportRecord>;

  newId(): string;
}

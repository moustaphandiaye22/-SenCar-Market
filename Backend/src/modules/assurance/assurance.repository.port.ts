import type {
  CreateOptionInput,
  CreateProduitInput,
  CreateSouscriptionInput,
  OptionRecord,
  ProduitRecord,
  SouscriptionRecord,
  UpdateOptionInput,
  UpdateProduitInput,
  UpdateSouscriptionInput,
  UserRecord,
  VehiculeSummaryRecord,
} from './assurance.models';

export const ASSURANCE_REPOSITORY_PORT = Symbol('ASSURANCE_REPOSITORY_PORT');

export interface AssuranceRepositoryPort {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  findVehiculeById(id: string): Promise<VehiculeSummaryRecord | null>;

  createProduit(data: CreateProduitInput): Promise<ProduitRecord>;
  findProduitById(id: string): Promise<ProduitRecord | null>;
  updateProduit(id: string, data: UpdateProduitInput): Promise<ProduitRecord>;
  findProduitsPaged(page: number, size: number): Promise<{ items: ProduitRecord[]; total: number }>;
  findProduitsActifs(): Promise<ProduitRecord[]>;

  createOption(data: CreateOptionInput): Promise<OptionRecord>;
  findOptionById(id: string): Promise<OptionRecord | null>;
  updateOption(id: string, data: UpdateOptionInput): Promise<OptionRecord>;
  findOptionsByProduitId(produitAssuranceId: string): Promise<OptionRecord[]>;
  findOptionsByIds(ids: string[]): Promise<OptionRecord[]>;

  createSouscription(data: CreateSouscriptionInput): Promise<SouscriptionRecord>;
  findSouscriptionById(id: string): Promise<SouscriptionRecord | null>;
  findSouscriptionsByUtilisateurId(utilisateurId: string): Promise<SouscriptionRecord[]>;
  updateSouscription(id: string, data: UpdateSouscriptionInput): Promise<SouscriptionRecord>;

  newId(): string;
}

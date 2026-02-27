import type { AvisRecord, BasicUserRecord, CreateAvisInput } from './avis.models';
import type { StatutAvis } from './types/avis.types';

export const AVIS_REPOSITORY_PORT = Symbol('AVIS_REPOSITORY_PORT');

export interface AvisRepositoryPort {
  findUserByEmail(email: string): Promise<BasicUserRecord | null>;
  findUserById(id: string): Promise<BasicUserRecord | null>;
  findVehiculeById(id: string): Promise<{ id: string } | null>;
  findGarageById(id: string): Promise<{ id: string } | null>;

  createAvis(data: CreateAvisInput): Promise<AvisRecord>;
  findAvisById(id: string): Promise<AvisRecord | null>;
  findAvisByUtilisateurPaged(
    utilisateurId: string,
    statut: StatutAvis,
    page: number,
    size: number,
  ): Promise<{ items: AvisRecord[]; total: number }>;
  findAvisByVehiculePaged(
    vehiculeId: string,
    statut: StatutAvis,
    page: number,
    size: number,
  ): Promise<{ items: AvisRecord[]; total: number }>;
  findAvisByGaragePaged(
    garageId: string,
    statut: StatutAvis,
    page: number,
    size: number,
  ): Promise<{ items: AvisRecord[]; total: number }>;

  getNoteMoyenneUtilisateur(utilisateurId: string): Promise<number | null>;
  getNoteMoyenneVehicule(vehiculeId: string): Promise<number | null>;
  getNoteMoyenneGarage(garageId: string): Promise<number | null>;

  existsByTransactionAndAuteur(transactionId: string, auteurId: string): Promise<boolean>;
  findByTransactionId(transactionId: string): Promise<Array<{ id: string }>>;
  updateAvisStatut(id: string, statut: StatutAvis): Promise<AvisRecord>;

  newId(): string;
}

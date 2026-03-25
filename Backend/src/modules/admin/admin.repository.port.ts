import type { AdminUserRecord, TransactionRecord, VehiculeRecord } from './admin.models';

export const ADMIN_REPOSITORY_PORT = Symbol('ADMIN_REPOSITORY_PORT');

export interface AdminRepositoryPort {
  findUserByEmail(email: string): Promise<AdminUserRecord | null>;
  findTypeUtilisateurByNom(nom: string): Promise<{ id: string; nom: string } | null>;
  findUsersPaged(page: number, size: number, sortBy: string, sortDir: 'asc' | 'desc'): Promise<{ items: AdminUserRecord[]; total: number }>;
  findUserById(id: string): Promise<AdminUserRecord | null>;
  updateUser(id: string, data: Record<string, unknown>): Promise<AdminUserRecord>;

  findVehiculesPaged(page: number, size: number, sortBy: string, sortDir: 'asc' | 'desc'): Promise<{ items: VehiculeRecord[]; total: number }>;
  findVehiculeById(id: string): Promise<VehiculeRecord | null>;
  updateVehicule(id: string, data: Record<string, unknown>): Promise<VehiculeRecord>;
  deleteVehicule(id: string): Promise<{ id: string }>;

  findTransactionsPaged(page: number, size: number, sortBy: string, sortDir: 'asc' | 'desc'): Promise<{ items: TransactionRecord[]; total: number }>;
  findTransactionsByUtilisateurId(utilisateurId: string): Promise<TransactionRecord[]>;
  findTransactionById(id: string): Promise<TransactionRecord | null>;
  createTransaction(data: {
    id: string;
    portefeuille: { connect: { id: string } };
    montant: number;
    typeTransaction: string;
    statut: string;
    description: string;
    dateTransaction: Date;
    createdAt: Date;
  }): Promise<TransactionRecord>;

  countUtilisateurs(): Promise<number>;
  countVehicules(): Promise<number>;
  countVehiculesByStatut(statut: string): Promise<number>;
  countReservations(): Promise<number>;
  countReservationsByStatut(statut: string): Promise<number>;
  countTransactions(): Promise<number>;
  countTransactionsByStatut(statut: string): Promise<number>;
  countAbonnements(): Promise<number>;
  countAbonnementsActifs(now: Date): Promise<number>;
  countTradeInByStatut(statut: string[]): Promise<number>;
  findTransactionsByStatut(statut: string): Promise<TransactionRecord[]>;

  createNotification(data: {
    id: string;
    utilisateur: { connect: { id: string } };
    titre: string;
    message: string;
    type: string;
    estLu: boolean;
    dateCreation: Date;
    referenceType?: string;
  }): Promise<{ id: string }>;
  findAllUsersIds(): Promise<Array<{ id: string }>>;

  newId(): string;
}

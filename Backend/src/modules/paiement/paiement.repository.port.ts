import type {
  CreatePaiementInput,
  CreatePaiementLogInput,
  CreatePortefeuilleInput,
  CreateTransactionInput,
  PaiementLogRecord,
  PaiementRecord,
  PortefeuilleRecord,
  ReservationRecord,
  TransactionRecord,
  UpdatePaiementInput,
  UpdatePortefeuilleInput,
  UserRecord,
} from './paiement.models';
import type { StatutPaiement } from './types/paiement.types';

export const PAIEMENT_REPOSITORY_PORT = Symbol('PAIEMENT_REPOSITORY_PORT');

export interface PaiementRepositoryPort {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  findReservationById(id: string): Promise<ReservationRecord | null>;

  createPaiement(data: CreatePaiementInput): Promise<PaiementRecord>;
  updatePaiement(id: string, data: UpdatePaiementInput): Promise<PaiementRecord>;
  findPaiementById(id: string): Promise<PaiementRecord | null>;
  findPaiementsByUtilisateurId(utilisateurId: string): Promise<PaiementRecord[]>;
  findPaiementsByReservationId(reservationId: string): Promise<PaiementRecord[]>;
  findPaiementsByStatut(statut: StatutPaiement): Promise<PaiementRecord[]>;
  findAllPaiementsPaged(page: number, size: number): Promise<{ items: PaiementRecord[]; total: number }>;
  findPaiementByReferenceExterne(referenceExterne: string): Promise<PaiementRecord | null>;
  findPaiementByReferenceTransaction(referenceTransaction: string): Promise<PaiementRecord | null>;

  findPortefeuilleByUtilisateurId(utilisateurId: string): Promise<PortefeuilleRecord | null>;
  createPortefeuille(data: CreatePortefeuilleInput): Promise<PortefeuilleRecord>;
  updatePortefeuille(id: string, data: UpdatePortefeuilleInput): Promise<PortefeuilleRecord>;

  createTransaction(data: CreateTransactionInput): Promise<TransactionRecord>;
  findTransactionById(id: string): Promise<TransactionRecord | null>;
  findTransactionsByUtilisateurId(utilisateurId: string): Promise<TransactionRecord[]>;
  hasEscrowReleaseTransaction(utilisateurId: string, referenceExterne: string): Promise<boolean>;
  transactionBelongsToUser(transactionId: string, utilisateurId: string): Promise<boolean>;

  createPaiementLog(data: CreatePaiementLogInput): Promise<PaiementLogRecord>;
  findLogsByPaiementId(paiementId: string): Promise<PaiementLogRecord[]>;

  newId(): string;
}

import type { StatutPaiement, StatutTransaction, TypePaiement, TypeTransaction } from './types/paiement.types';

type ConnectById = { connect: { id: string } };

type UserRole = { nom: string };

export type UserRecord = {
  id: string;
  email: string;
  typeUtilisateur: UserRole | null;
};

export type ReservationRecord = {
  id: string;
  annonceLocation: { proprietaireId: string } | null;
};

export type PaiementRecord = {
  id: string;
  utilisateurId: string | null;
  reservationId: string | null;
  montant: unknown;
  montantEscrow: unknown;
  commission: unknown;
  statut: StatutPaiement | null;
  methodePaiement: TypePaiement | null;
  datePaiement: Date | null;
  referenceTransaction: string | null;
  referenceExterne: string | null;
  urlPaiement: string | null;
  isEscrow: boolean | null;
  dateExpiration: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  utilisateur: { id: string } | null;
  reservation: { id: string; annonceLocation: { proprietaireId: string } | null } | null;
};

export type PortefeuilleRecord = {
  id: string;
  utilisateurId: string;
  solde: unknown;
  soldeBloque: unknown;
  dateDerniereRecharge: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type TransactionRecord = {
  id: string;
  portefeuilleId: string;
  montant: unknown;
  typeTransaction: TypeTransaction;
  statut: StatutTransaction;
  description: string | null;
  referenceExterne: string | null;
  dateTransaction: Date | null;
  createdAt: Date | null;
};

export type PaiementLogRecord = {
  id: string;
  paiementId: string | null;
  action: string;
  details: string | null;
  dateAction: Date | null;
};

export type CreatePaiementInput = {
  id: string;
  utilisateur?: ConnectById;
  reservation?: ConnectById;
  montant: number;
  montantEscrow: number;
  commission: number;
  methodePaiement: TypePaiement;
  statut: StatutPaiement;
  isEscrow: boolean;
  referenceTransaction: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdatePaiementInput = Partial<{
  statut: StatutPaiement;
  datePaiement: Date;
  referenceExterne: string;
  urlPaiement: string;
  updatedAt: Date;
}>;

export type CreatePortefeuilleInput = {
  id: string;
  utilisateur: ConnectById;
  solde: number;
  soldeBloque: number;
  isActif: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdatePortefeuilleInput = Partial<{
  solde: number;
  soldeBloque: number;
  dateDerniereRecharge: Date;
  updatedAt: Date;
}>;

export type CreateTransactionInput = {
  id: string;
  portefeuille: ConnectById;
  montant: number;
  typeTransaction: TypeTransaction;
  statut: StatutTransaction;
  description?: string;
  referenceExterne?: string;
  dateTransaction: Date;
  createdAt: Date;
};

export type CreatePaiementLogInput = {
  id: string;
  paiementId?: string;
  action: string;
  details?: string;
  dateAction: Date;
};

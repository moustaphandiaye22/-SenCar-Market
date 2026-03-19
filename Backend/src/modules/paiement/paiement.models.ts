import type { StatutPaiement, StatutTransaction, TypePaiement, TypeTransaction } from './types/paiement.types';

export type UserRole = { nom: string };

export type UserRecord = {
  id: string;
  email: string;
  type_utilisateur: UserRole | null;
};

export type ReservationRecord = {
  id: string;
  annonce_location: { proprietaire_id: string } | null;
};

export type PaiementRecord = {
  id: string;
  utilisateur_id: string | null;
  reservation_id: string | null;
  montant: unknown;
  montant_escrow: unknown;
  commission: unknown;
  statut: StatutPaiement | null;
  methode_paiement: TypePaiement | null;
  date_paiement: Date | null;
  reference_transaction: string | null;
  reference_externe: string | null;
  url_paiement: string | null;
  is_escrow: boolean | null;
  date_expiration: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
  utilisateur: { id: string } | null;
  reservation: { id: string; annonce_location: { proprietaire_id: string } | null } | null;
};

export type PortefeuilleRecord = {
  id: string;
  utilisateur_id: string;
  solde: unknown;
  solde_bloque: unknown;
  date_derniere_recharge: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type TransactionRecord = {
  id: string;
  portefeuille_id: string;
  montant: unknown;
  type_transaction: TypeTransaction;
  statut: StatutTransaction;
  description: string | null;
  reference_externe: string | null;
  date_transaction: Date | null;
  created_at: Date | null;
};

export type PaiementLogRecord = {
  id: string;
  paiement_id: string | null;
  action: string;
  details: string | null;
  date_action: Date | null;
};

export type CreatePaiementInput = {
  id: string;
  utilisateur_id?: string;
  reservation_id?: string;
  montant: number;
  montant_escrow: number;
  commission: number;
  methode_paiement: TypePaiement;
  statut: StatutPaiement;
  is_escrow: boolean;
  reference_transaction: string;
};

export type UpdatePaiementInput = Partial<{
  statut: StatutPaiement;
  date_paiement: Date;
  reference_externe: string;
  url_paiement: string;
  updated_at: Date;
}>;

export type CreatePortefeuilleInput = {
  id: string;
  utilisateur_id: string;
  solde: number;
  solde_bloque: number;
  is_actif: boolean;
};

export type UpdatePortefeuilleInput = Partial<{
  solde: number;
  solde_bloque: number;
  date_derniere_recharge: Date;
  updated_at: Date;
}>;

export type CreateTransactionInput = {
  id: string;
  portefeuille_id: string;
  montant: number;
  type_transaction: TypeTransaction;
  statut: StatutTransaction;
  description?: string;
  reference_externe?: string;
  date_transaction: Date;
};

export type CreatePaiementLogInput = {
  id: string;
  paiement_id?: string;
  action: string;
  details?: string;
  date_action: Date;
};

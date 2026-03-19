import type {
  AbonnementRecord,
  BoostAnnonceRecord,
  CreateAbonnementInput,
  CreateBoostInput,
  CreateUtilisateurAbonnementInput,
  UpdateAbonnementInput,
  UpdateBoostInput,
  UpdateUtilisateurAbonnementInput,
  UserRecord,
  UtilisateurAbonnementRecord,
} from "./abonnement.models";

export const ABONNEMENT_REPOSITORY_PORT = Symbol("ABONNEMENT_REPOSITORY_PORT");

export interface AbonnementRepositoryPort {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;

  createAbonnement(data: CreateAbonnementInput): Promise<AbonnementRecord>;
  updateAbonnement(
    id: string,
    data: UpdateAbonnementInput,
  ): Promise<AbonnementRecord>;
  findAbonnementById(id: string): Promise<AbonnementRecord | null>;
  findAllAbonnements(): Promise<AbonnementRecord[]>;

  createUtilisateurAbonnement(
    data: CreateUtilisateurAbonnementInput,
  ): Promise<UtilisateurAbonnementRecord>;
  updateUtilisateurAbonnement(
    id: string,
    data: UpdateUtilisateurAbonnementInput,
  ): Promise<UtilisateurAbonnementRecord>;
  findActiveSubscription(
    utilisateurId: string,
    now: Date,
  ): Promise<UtilisateurAbonnementRecord | null>;
  findPendingSubscription(
    utilisateurId: string,
  ): Promise<UtilisateurAbonnementRecord | null>;
  findSubscriptionsByUtilisateurPaged(
    utilisateurId: string,
    page: number,
    size: number,
  ): Promise<{ items: UtilisateurAbonnementRecord[]; total: number }>;
  findExpiredActiveSubscriptions(
    now: Date,
  ): Promise<UtilisateurAbonnementRecord[]>;
  findExpiringSoon(
    now: Date,
    endDate: Date,
  ): Promise<UtilisateurAbonnementRecord[]>;
  findUtilisateurAbonnementById(
    id: string,
  ): Promise<UtilisateurAbonnementRecord | null>;

  createBoost(data: CreateBoostInput): Promise<BoostAnnonceRecord>;
  updateBoost(id: string, data: UpdateBoostInput): Promise<BoostAnnonceRecord>;
  deleteBoost(id: string): Promise<BoostAnnonceRecord>;
  findBoostById(id: string): Promise<BoostAnnonceRecord | null>;
  findBoostsByAnnonceLocationId(
    annonceLocationId: string,
    now: Date,
  ): Promise<BoostAnnonceRecord[]>;
  findPaymentById(
    paymentId: string,
  ): Promise<{ id: string; statut: string } | null>;

  newId(): string;
}

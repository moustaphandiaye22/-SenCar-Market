import type {
  StatutAbonnement,
  TypeAbonnement,
} from "./types/abonnement.types";

type ConnectById = { connect: { id: string } };

type UserRole = { nom: string };

export type UserRecord = {
  id: string;
  email: string;
  typeUtilisateur: UserRole | null;
};

export type AbonnementRecord = {
  id: string;
  nom: string;
  description: string | null;
  prixMensuel: unknown;
  dureeJours: number | null;
  nombreAnnonces: number | null;
  estVedette: boolean | null;
  estCertifie: boolean | null;
  type: TypeAbonnement | null;
  estActif: boolean | null;
  avantages: string | null;
  prixAnnuel: unknown;
  nombreBoostsGratuits: number | null;
  accesPrioritaire: boolean | null;
  supportPrioritaire: boolean | null;
};

export type UtilisateurAbonnementRecord = {
  id: string;
  utilisateurId: string;
  abonnementId: string;
  dateDebut: Date | null;
  dateFin: Date | null;
  statut: StatutAbonnement;
  nombreAnnoncesUtilisees: number | null;
  abonnement: {
    id: string;
    nom: string;
    nombre_annonces: number | null;
  } | null;
};

export type StatutBoost = "EN_ATTENTE" | "ACTIF" | "EXPIRE" | "ANNULE";

export type BoostAnnonceRecord = {
  id: string;
  annonceLocationId: string;
  dateDebut: Date | null;
  dateFin: Date | null;
  niveauBoost: string | null;
  statut: StatutBoost | null;
  paymentId: string | null;
};

export type CreateAbonnementInput = {
  id: string;
  nom: string;
  description?: string;
  prixMensuel: number;
  dureeJours: number;
  nombreAnnonces: number;
  estVedette: boolean;
  estCertifie: boolean;
  type?: TypeAbonnement;
  estActif: boolean;
  avantages?: string;
  prixAnnuel?: number;
  nombreBoostsGratuits?: number;
  accesPrioritaire?: boolean;
  supportPrioritaire?: boolean;
};

export type UpdateAbonnementInput = Partial<CreateAbonnementInput>;

export type CreateUtilisateurAbonnementInput = {
  id: string;
  utilisateur: ConnectById;
  abonnement: ConnectById;
  date_debut: Date;
  date_fin: Date;
  statut: StatutAbonnement;
  nombre_annonces_utilisees: number;
};

export type UpdateUtilisateurAbonnementInput = Partial<{
  date_debut: Date;
  date_fin: Date;
  statut: StatutAbonnement;
  nombre_annonces_utilisees: number;
}>;

export type CreateBoostInput = {
  id: string;
  annonce_location: ConnectById;
  dateDebut: Date;
  dateFin: Date;
  niveauBoost: string;
  statut?: StatutBoost;
  payment_id?: string;
};

export type UpdateBoostInput = Partial<{
  dateDebut: Date;
  dateFin: Date;
  niveauBoost: string;
  statut: StatutBoost;
  payment_id: string;
}>;

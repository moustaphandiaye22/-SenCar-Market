import type { StatutAbonnement, TypeAbonnement } from './types/abonnement.types';

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
};

export type UtilisateurAbonnementRecord = {
  id: string;
  utilisateurId: string;
  abonnementId: string;
  dateDebut: Date | null;
  dateFin: Date | null;
  statut: StatutAbonnement;
  nombreAnnoncesUtilisees: number | null;
  abonnement: { id: string; nom: string; nombreAnnonces: number | null } | null;
};

export type BoostAnnonceRecord = {
  id: string;
  annonceLocationId: string;
  dateDebut: Date | null;
  dateFin: Date | null;
  niveauBoost: string | null;
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
};

export type UpdateAbonnementInput = Partial<CreateAbonnementInput>;

export type CreateUtilisateurAbonnementInput = {
  id: string;
  utilisateur: ConnectById;
  abonnement: ConnectById;
  dateDebut: Date;
  dateFin: Date;
  statut: StatutAbonnement;
  nombreAnnoncesUtilisees: number;
};

export type UpdateUtilisateurAbonnementInput = Partial<{
  dateDebut: Date;
  dateFin: Date;
  statut: StatutAbonnement;
  nombreAnnoncesUtilisees: number;
}>;

export type CreateBoostInput = {
  id: string;
  annonceLocation: ConnectById;
  dateDebut: Date;
  dateFin: Date;
  niveauBoost: string;
};

export type UpdateBoostInput = Partial<{
  dateDebut: Date;
  dateFin: Date;
  niveauBoost: string;
}>;

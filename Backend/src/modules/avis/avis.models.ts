import type { StatutAvis, TypeAvis } from './types/avis.types';

export type AvisRecord = {
  id: string;
  auteurId: string;
  cibleUtilisateurId: string | null;
  vehiculeId: string | null;
  garageId: string | null;
  typeAvis: TypeAvis | null;
  transactionId: string;
  note: number;
  commentaire: string | null;
  statut: StatutAvis | null;
  createdAt: Date | null;
  auteur: { id: string; nom: string | null; prenom: string | null };
};

export type CreateAvisInput = {
  id: string;
  auteur: { connect: { id: string } };
  cibleUtilisateur?: { connect: { id: string } };
  vehicule?: { connect: { id: string } };
  garageId?: string;
  typeAvis: TypeAvis;
  transactionId: string;
  note: number;
  commentaire?: string;
  statut: StatutAvis;
  createdAt: Date;
};

export type BasicUserRecord = {
  id: string;
  email?: string;
  nom: string | null;
  prenom: string | null;
};

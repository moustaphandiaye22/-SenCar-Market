import type { StatutAvis, TypeAvis } from './types/avis.types';

export type AvisRecord = {
  id: string;
  auteur_id: string;
  cible_utilisateur_id: string | null;
  vehicule_id: string | null;
  garage_id: string | null;
  type_avis: TypeAvis | null;
  transaction_id: string;
  note: number;
  commentaire: string | null;
  statut: StatutAvis | null;
  created_at: Date | null;
  auteur: { id: string; nom: string | null; prenom: string | null };
};

export type CreateAvisInput = {
  id: string;
  auteur_id: string;
  cible_utilisateur_id?: string;
  vehicule_id?: string;
  garage_id?: string;
  type_avis: TypeAvis;
  transaction_id: string;
  note: number;
  commentaire?: string;
  statut: StatutAvis;
  created_at: Date;
};

export type BasicUserRecord = {
  id: string;
  email?: string;
  nom: string | null;
  prenom: string | null;
};

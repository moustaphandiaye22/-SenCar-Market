import type { StatutTradeIn } from './types/tradein.types';

export type VehiculeMini = {
  id: string;
  annee_fabrication: number | null;
  prix_vente: unknown;
  marque: { nom: string | null } | null;
  modele: { nom: string | null } | null;
};

export type UserRole = { nom: string | null };
export type UserRecord = {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  type_utilisateur: UserRole | null;
};

export type DemandeRecord = {
  id: string;
  utilisateur_id: string;
  vehicule_actuel_id: string;
  vehicule_souhaite_id: string | null;
  statut: StatutTradeIn;
  prix_estime?: unknown;
  prix_propose?: unknown;
  kilometrage_actuel?: number | null;
  etat_vehicule?: string | null;
  date_soumission: Date | null;
  date_traitement?: Date | null;
  date_evaluation?: Date | null;
  motif_rejet?: string | null;
  commentaire_admin?: string | null;
  est_notifie: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
  utilisateur: { id: string; nom: string | null };
  vehicule_actuel: VehiculeMini;
  vehicule_souhaite: VehiculeMini | null;
};

export type CreateDemandeInput = {
  id: string;
  utilisateur_id: string;
  vehicule_actuel_id: string;
  vehicule_souhaite_id?: string;
  statut: StatutTradeIn;
  kilometrage_actuel: number;
  etat_vehicule: string;
  date_soumission: Date;
  est_notifie: boolean;
};

export type UpdateDemandeInput = Partial<{
  statut: StatutTradeIn;
  prix_estime: number;
  prix_propose: number;
  kilometrage_actuel: number;
  etat_vehicule: string;
  date_traitement: Date;
  date_evaluation: Date;
  motif_rejet: string;
  commentaire_admin: string;
  est_notifie: boolean;
  updated_at: Date;
}>;

export type CreateHistoriqueEstimationInput = {
  id: string;
  vehicule_id: string;
  marque: string;
  modele: string;
  annee_fabrication?: number;
  kilometrage: number;
  etat_vehicule: string;
  prix_estime: number;
  prix_minimum: number;
  prix_maximum: number;
  score_condition: number;
  recommandation: string;
  date_estimation: Date;
};

export type CreateNotificationInput = {
  id: string;
  utilisateur_id: string;
  titre: string;
  message: string;
  type: string;
  est_lu: boolean;
  date_creation: Date;
};

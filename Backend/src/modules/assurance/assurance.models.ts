import type { StatutAssurance, TypeAssurance } from './types/assurance.types';

export type UserRecord = {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  type_utilisateur: { nom: string | null } | null;
};

export type VehiculeSummaryRecord = {
  id: string;
  marque: { nom: string | null } | null;
  modele: { nom: string | null } | null;
};

export type ProduitRecord = {
  id: string;
  nom: string;
  description: string | null;
  prix_base: unknown;
  type_assurance: string;
  duree_mois: number | null;
  est_actif: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
  option_assurance: OptionRecord[];
};

export type OptionRecord = {
  id: string;
  produit_assurance_id: string;
  nom: string;
  description: string | null;
  prix_supplementaire: unknown;
  est_actif: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type SouscriptionRecord = {
  id: string;
  utilisateur_id: string;
  produit_assurance_id: string;
  vehicule_id: string;
  statut: string;
  montant_total: unknown;
  date_debut: Date | null;
  date_fin: Date | null;
  numero_contrat: string | null;
  document_url: string | null;
  paiement_id: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  utilisateur: { id: string; nom: string | null };
  produit_assurance: { id: string; nom: string };
  vehicule: VehiculeSummaryRecord;
  souscription_options: Array<{ option_assurance: OptionRecord }>;
};

export type CreateProduitInput = {
  id: string;
  nom: string;
  description?: string;
  prix_base: number;
  type_assurance: TypeAssurance;
  duree_mois?: number;
  est_actif: boolean;
  created_at: Date;
  updated_at: Date;
};

export type UpdateProduitInput = Partial<{
  nom: string;
  description: string;
  prix_base: number;
  type_assurance: TypeAssurance;
  duree_mois: number;
  est_actif: boolean;
  updated_at: Date;
}>;

export type CreateOptionInput = {
  id: string;
  produit_assurance_id: string;
  nom: string;
  description?: string;
  prix_supplementaire: number;
  est_actif: boolean;
  created_at: Date;
  updated_at: Date;
};

export type UpdateOptionInput = Partial<{
  produit_assurance_id: string;
  nom: string;
  description: string;
  prix_supplementaire: number;
  est_actif: boolean;
  updated_at: Date;
}>;

export type CreateSouscriptionInput = {
  id: string;
  utilisateur_id: string;
  produit_assurance_id: string;
  vehicule_id: string;
  statut: StatutAssurance;
  montant_total: number;
  date_debut: Date;
  date_fin: Date;
  numero_contrat: string;
  created_at: Date;
  updated_at: Date;
  optionsSelectionnees?: { create: Array<{ option_id: string }> };
};

export type UpdateSouscriptionInput = Partial<{
  statut: StatutAssurance;
  paiement_id: string;
  document_url: string;
  updated_at: Date;
}>;

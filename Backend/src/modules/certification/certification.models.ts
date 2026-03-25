import type {
  EtatVehiculeInspection,
  ResultatInspection,
  StatutDemandeCertification,
} from "./types/certification.types";

type ConnectById = { connect: { id: string } };

export type UserRecord = {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  type_utilisateur: { nom: string | null } | null;
};

export type VehiculeMini = {
  id: string;
  marque: { nom: string | null } | null;
  modele: { nom: string | null } | null;
};

export type DemandeRecord = {
  id: string;
  utilisateur_id: string;
  vehicule_id: string;
  statut: string;
  montant_paiement: unknown;
  paiement_id: string | null;
  inspecteur_id: string | null;
  date_soumission: Date | null;
  date_traitement: Date | null;
  date_inspection: Date | null;
  motif_rejet: string | null;
  badge_certifie_url: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  utilisateur_demande_certification_utilisateur_idToutilisateur: {
    id: string;
    nom: string | null;
  };
  vehicule: VehiculeMini;
  utilisateur_demande_certification_inspecteur_idToutilisateur: {
    id: string;
    nom: string | null;
  } | null;
};

export type InspectionRecord = {
  id: string;
  demande_certification_id: string;
  inspecteur_id: string;
  date_inspection: Date | null;
  resultat: string | null;
  commentaire: string | null;
  kilometrage: number | null;
  etat_moteur: string | null;
  etat_generateur: string | null;
  etat_freinage: string | null;
  etat_suspension: string | null;
  etat_transmission: string | null;
  etat_pneus: string | null;
  etat_carrosserie: string | null;
  etat_interieur: string | null;
  score_total: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  demande_certification: { id: string };
  utilisateur: { id: string; nom: string | null };
};

export type RapportRecord = {
  id: string;
  inspection_id: string;
  url_rapport_pdf: string | null;
  date_generation: Date | null;
  score_globale: number | null;
  recommendations: string | null;
  conclusion: string | null;
  est_approuve: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
  inspection: { id: string };
};

export type CreateDemandeInput = {
  id: string;
  utilisateur: ConnectById;
  vehicule: ConnectById;
  statut: StatutDemandeCertification;
  montant_paiement: number;
  date_soumission: Date;
  created_at: Date;
  updated_at: Date;
};

export type UpdateDemandeInput = Partial<{
  statut: StatutDemandeCertification;
  paiement_id: string;
  utilisateur_demande_certification_inspecteur_idToutilisateur: ConnectById;
  date_traitement: Date;
  date_inspection: Date;
  motif_rejet: string;
  badge_certifie_url: string;
  updated_at: Date;
}>;

export type CreateInspectionInput = {
  id: string;
  demande_certification: ConnectById;
  utilisateur: ConnectById;
  date_inspection: Date;
  resultat: ResultatInspection;
  commentaire?: string;
  kilometrage?: number;
  etat_moteur?: EtatVehiculeInspection;
  etat_generateur?: EtatVehiculeInspection;
  etat_freinage?: EtatVehiculeInspection;
  etat_suspension?: EtatVehiculeInspection;
  etat_transmission?: EtatVehiculeInspection;
  etat_pneus?: EtatVehiculeInspection;
  etat_carrosserie?: EtatVehiculeInspection;
  etat_interieur?: EtatVehiculeInspection;
  created_at: Date;
  updated_at: Date;
};

export type UpdateInspectionInput = Partial<{
  date_inspection: Date;
  resultat: ResultatInspection;
  commentaire: string;
  kilometrage: number;
  etat_moteur: EtatVehiculeInspection;
  etat_generateur: EtatVehiculeInspection;
  etat_freinage: EtatVehiculeInspection;
  etat_suspension: EtatVehiculeInspection;
  etat_transmission: EtatVehiculeInspection;
  etat_pneus: EtatVehiculeInspection;
  etat_carrosserie: EtatVehiculeInspection;
  etat_interieur: EtatVehiculeInspection;
  score_total: number;
  updated_at: Date;
}>;

export type CreateRapportInput = {
  id: string;
  inspection: ConnectById;
  url_rapport_pdf?: string;
  date_generation: Date;
  score_globale?: number;
  recommendations?: string;
  conclusion?: string;
  est_approuve?: boolean;
  created_at: Date;
  updated_at: Date;
};

export type UpdateRapportInput = Partial<{
  url_rapport_pdf: string;
  date_generation: Date;
  score_globale: number;
  recommendations: string;
  conclusion: string;
  est_approuve: boolean;
  updated_at: Date;
}>;

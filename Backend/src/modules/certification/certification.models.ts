import type {
  EtatVehiculeInspection,
  ResultatInspection,
  StatutDemandeCertification,
} from './types/certification.types';

type ConnectById = { connect: { id: string } };

export type UserRecord = {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  typeUtilisateur: { nom: string | null } | null;
};

export type VehiculeMini = {
  id: string;
  marque: { nom: string | null } | null;
  modele: { nom: string | null } | null;
};

export type DemandeRecord = {
  id: string;
  utilisateurId: string;
  vehiculeId: string;
  statut: string;
  montantPaiement: unknown;
  paiementId: string | null;
  inspecteurId: string | null;
  dateSoumission: Date | null;
  dateTraitement: Date | null;
  dateInspection: Date | null;
  motifRejet: string | null;
  badgeCertifieUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  utilisateur: { id: string; nom: string | null };
  vehicule: VehiculeMini;
  inspecteur: { id: string; nom: string | null } | null;
};

export type InspectionRecord = {
  id: string;
  demandeCertificationId: string;
  inspecteurId: string;
  dateInspection: Date | null;
  resultat: string | null;
  commentaire: string | null;
  kilometrage: number | null;
  etatMoteur: string | null;
  etatGenerateur: string | null;
  etatFreinage: string | null;
  etatSuspension: string | null;
  etatTransmission: string | null;
  etatPneus: string | null;
  etatCarrosserie: string | null;
  etatInterieur: string | null;
  scoreTotal: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  demandeCertification: { id: string };
  inspecteur: { id: string; nom: string | null };
};

export type RapportRecord = {
  id: string;
  inspectionId: string;
  urlRapportPdf: string | null;
  dateGeneration: Date | null;
  scoreGlobale: number | null;
  recommendations: string | null;
  conclusion: string | null;
  estApprouve: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  inspection: { id: string };
};

export type CreateDemandeInput = {
  id: string;
  utilisateur: ConnectById;
  vehicule: ConnectById;
  statut: StatutDemandeCertification;
  montantPaiement: number;
  dateSoumission: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateDemandeInput = Partial<{
  statut: StatutDemandeCertification;
  paiementId: string;
  inspecteur: ConnectById;
  dateTraitement: Date;
  dateInspection: Date;
  motifRejet: string;
  badgeCertifieUrl: string;
  updatedAt: Date;
}>;

export type CreateInspectionInput = {
  id: string;
  demandeCertification: ConnectById;
  inspecteur: ConnectById;
  dateInspection: Date;
  resultat: ResultatInspection;
  commentaire?: string;
  kilometrage?: number;
  etatMoteur?: EtatVehiculeInspection;
  etatGenerateur?: EtatVehiculeInspection;
  etatFreinage?: EtatVehiculeInspection;
  etatSuspension?: EtatVehiculeInspection;
  etatTransmission?: EtatVehiculeInspection;
  etatPneus?: EtatVehiculeInspection;
  etatCarrosserie?: EtatVehiculeInspection;
  etatInterieur?: EtatVehiculeInspection;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateInspectionInput = Partial<{
  dateInspection: Date;
  resultat: ResultatInspection;
  commentaire: string;
  kilometrage: number;
  etatMoteur: EtatVehiculeInspection;
  etatGenerateur: EtatVehiculeInspection;
  etatFreinage: EtatVehiculeInspection;
  etatSuspension: EtatVehiculeInspection;
  etatTransmission: EtatVehiculeInspection;
  etatPneus: EtatVehiculeInspection;
  etatCarrosserie: EtatVehiculeInspection;
  etatInterieur: EtatVehiculeInspection;
  scoreTotal: number;
  updatedAt: Date;
}>;

export type CreateRapportInput = {
  id: string;
  inspection: ConnectById;
  urlRapportPdf?: string;
  dateGeneration: Date;
  scoreGlobale?: number;
  recommendations?: string;
  conclusion?: string;
  estApprouve?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateRapportInput = Partial<{
  urlRapportPdf: string;
  dateGeneration: Date;
  scoreGlobale: number;
  recommendations: string;
  conclusion: string;
  estApprouve: boolean;
  updatedAt: Date;
}>;

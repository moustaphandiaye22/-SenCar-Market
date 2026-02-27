import type { StatutAssurance, TypeAssurance } from './types/assurance.types';

export type UserRecord = {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  typeUtilisateur: { nom: string | null } | null;
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
  prixBase: unknown;
  typeAssurance: string;
  dureeMois: number | null;
  estActif: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  options: OptionRecord[];
};

export type OptionRecord = {
  id: string;
  produitAssuranceId: string;
  nom: string;
  description: string | null;
  prixSupplementaire: unknown;
  estActif: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type SouscriptionRecord = {
  id: string;
  utilisateurId: string;
  produitAssuranceId: string;
  vehiculeId: string;
  statut: string;
  montantTotal: unknown;
  dateDebut: Date | null;
  dateFin: Date | null;
  numeroContrat: string | null;
  documentUrl: string | null;
  paiementId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  utilisateur: { id: string; nom: string | null };
  produitAssurance: { id: string; nom: string };
  vehicule: VehiculeSummaryRecord;
  optionsSelectionnees: Array<{ option: OptionRecord }>;
};

type ConnectById = { connect: { id: string } };

export type CreateProduitInput = {
  id: string;
  nom: string;
  description?: string;
  prixBase: number;
  typeAssurance: TypeAssurance;
  dureeMois?: number;
  estActif: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateProduitInput = Partial<{
  nom: string;
  description: string;
  prixBase: number;
  typeAssurance: TypeAssurance;
  dureeMois: number;
  estActif: boolean;
  updatedAt: Date;
}>;

export type CreateOptionInput = {
  id: string;
  produitAssurance: ConnectById;
  nom: string;
  description?: string;
  prixSupplementaire: number;
  estActif: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateOptionInput = Partial<{
  produitAssurance: ConnectById;
  nom: string;
  description: string;
  prixSupplementaire: number;
  estActif: boolean;
  updatedAt: Date;
}>;

export type CreateSouscriptionInput = {
  id: string;
  utilisateur: ConnectById;
  produitAssurance: ConnectById;
  vehicule: ConnectById;
  statut: StatutAssurance;
  montantTotal: number;
  dateDebut: Date;
  dateFin: Date;
  numeroContrat: string;
  createdAt: Date;
  updatedAt: Date;
  optionsSelectionnees?: { create: Array<{ option: ConnectById }> };
};

export type UpdateSouscriptionInput = Partial<{
  statut: StatutAssurance;
  paiementId: string;
  documentUrl: string;
  updatedAt: Date;
}>;

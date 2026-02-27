import type { StatutTradeIn } from './types/tradein.types';

type ConnectById = { connect: { id: string } };

export type VehiculeMini = {
  id: string;
  anneeFabrication: number | null;
  prixVente: unknown;
  marque: { nom: string | null } | null;
  modele: { nom: string | null } | null;
};

export type UserRole = { nom: string | null };
export type UserRecord = {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  typeUtilisateur: UserRole | null;
};

export type DemandeRecord = {
  id: string;
  utilisateurId: string;
  vehiculeActuelId: string;
  vehiculeSouhaiteId: string | null;
  statut: string;
  prixEstime: unknown;
  prixPropose: unknown;
  kilometrageActuel: number | null;
  etatVehicule: string | null;
  dateSoumission: Date | null;
  dateTraitement: Date | null;
  dateEvaluation: Date | null;
  motifRejet: string | null;
  commentaireAdmin: string | null;
  estNotifie: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  utilisateur: { id: string; nom: string | null };
  vehiculeActuel: VehiculeMini;
  vehiculeSouhaite: VehiculeMini | null;
};

export type CreateDemandeInput = {
  id: string;
  utilisateur: ConnectById;
  vehiculeActuel: ConnectById;
  vehiculeSouhaite?: ConnectById;
  statut: StatutTradeIn;
  kilometrageActuel: number;
  etatVehicule: string;
  dateSoumission: Date;
  estNotifie: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateDemandeInput = Partial<{
  statut: StatutTradeIn;
  prixEstime: number;
  prixPropose: number;
  kilometrageActuel: number;
  etatVehicule: string;
  dateTraitement: Date;
  dateEvaluation: Date;
  motifRejet: string;
  commentaireAdmin: string;
  estNotifie: boolean;
  updatedAt: Date;
}>;

export type CreateHistoriqueEstimationInput = {
  id: string;
  vehiculeId: string;
  marque: string;
  modele: string;
  anneeFabrication?: number;
  kilometrage: number;
  etatVehicule: string;
  prixEstime: number;
  prixMinimum: number;
  prixMaximum: number;
  scoreCondition: number;
  recommandation: string;
  dateEstimation: Date;
};

export type CreateNotificationInput = {
  id: string;
  utilisateur: ConnectById;
  titre: string;
  message: string;
  type: string;
  estLu: boolean;
  dateCreation: Date;
};

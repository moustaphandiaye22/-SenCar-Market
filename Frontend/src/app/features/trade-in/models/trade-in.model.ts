export interface DemandeTradeIn {
  id: string;
  utilisateurId: string;
  utilisateurNom: string | null;
  vehiculeActuelId: string;
  vehiculeActuelDescription: string | null;
  vehiculeSouhaiteId: string | null;
  vehiculeSouhaiteDescription: string | null;
  statut: string;
  prixEstime: number | null;
  prixPropose: number | null;
  kilometrageActuel: number | null;
  etatVehicule: string | null;
  dateSoumission: string | null;
  dateTraitement: string | null;
  dateEvaluation: string | null;
  motifRejet: string | null;
  commentaireAdmin: string | null;
  estNotifie: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  photosUrls?: string[];
}

export interface Estimation {
  prixEstime: number;
  prixMinimum: number;
  prixMaximum: number;
  scoreCondition: number;
  recommandation: string;
}

export interface CreateTradeInRequest {
  vehiculeActuelId?: string;
  vehiculeSouhaiteId?: string;
  marque?: string;
  modele?: string;
  anneeFabrication?: number;
  kilometrageActuel?: number;
  etatVehicule: string;
  description?: string;
}

export interface ValidationTradeInRequest {
  nouveauStatut: string;
  prixPropose?: number;
  commentaireAdmin?: string;
  motifRejet?: string;
}

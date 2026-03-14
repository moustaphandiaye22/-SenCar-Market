export interface VehiculeResponse {
  id: string;
  marque: string | null;
  marqueId: string | null;
  modele: string | null;
  modeleId: string | null;
  anneeFabrication: number | null;
  kilometrage: number | null;
  carburant: string | null;
  carburantId: string | null;
  boiteVitesse: string | null;
  boiteVitesseId: string | null;
  couleur: string | null;
  prixVente: string | null;
  description: string | null;
  numeroVin: string | null;
  immatriculation: string | null;
  statut: string;
  prixNegociable: boolean | null;
  certifie: boolean | null;
  titre: string | null;
  nombrePortes: number | null;
  nombrePlaces: number | null;
  cylindree: string | null;
  puissanceFiscale: string | null;
  estGarantie: boolean | null;
  garantieMois: number | null;
  photosUrls: string[];
  estBoost: boolean | null;
  boostDebut: Date | null;
  boostFin: Date | null;
  vues: number | null;
  nombreFavoris: number | null;
  estFavori: boolean;
  proprietaireNom: string | null;
  proprietaireId: string;
  createdAt: Date | null;
}

export interface VehiculeFilter {
  q?: string;
  marqueId?: string;
  modeleId?: string;
  prixMin?: number;
  prixMax?: number;
  anneeMin?: number;
  anneeMax?: number;
  carburant?: string;
  boiteVitesse?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface PaginatedVehiculeResponse {
  content: VehiculeResponse[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
  first: boolean;
}

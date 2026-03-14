export interface AnnonceLocation {
  id: string;
  vehiculeId: string | null;
  vehiculeMarque: string | null;
  vehiculeModele: string | null;
  vehiculePhoto: string | null;
  proprietaireId: string;
  proprietaireNom: string | null;
  tarifJournalier: string | null;
  description: string | null;
  conditions: string | null;
  caution: string | null;
  kilometrageInclus: number | null;
  tarifKmSupplementaire: string | null;
  statut: string | null;
  actif: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ReservationLocation {
  id: string;
  annonceLocationId: string;
  vehiculeMarque: string | null;
  vehiculeModele: string | null;
  locataireId: string;
  locataireNom: string | null;
  locataireEmail: string | null;
  statut: string | null;
  coutTotal: string | null;
  caution: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  dateCreation: string | null;
  motifAnnulation: string | null;
  paiementId: string | null;
  paiementStatut: string | null;
}

export interface DisponibiliteLocation {
  id: string;
  annonceLocationId: string;
  date: string;
  estDisponible: boolean;
}

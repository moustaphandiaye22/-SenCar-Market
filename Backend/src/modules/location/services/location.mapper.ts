import { Injectable } from '@nestjs/common';

import { AnnonceLocationResponseDto } from '../dto/annonce-location-response.dto';
import { DisponibiliteLocationResponseDto } from '../dto/disponibilite-location-response.dto';
import { ReservationLocationResponseDto } from '../dto/reservation-location-response.dto';
import { AnnonceRecord, DisponibiliteRecord, ReservationRecord } from '../location.models';

@Injectable()
export class LocationMapper {
  toAnnonceResponse(annonce: AnnonceRecord): AnnonceLocationResponseDto {
    return {
      id: annonce.id,
      vehiculeId: annonce.vehicule_id,
      vehiculeMarque: annonce.vehicule?.marque?.nom ?? null,
      vehiculeModele: annonce.vehicule?.modele?.nom ?? null,
      vehiculePhoto: (annonce.vehicule?.photo_vehicule?.find(p => p.est_principale)?.url) || (annonce.vehicule?.photo_vehicule?.[0]?.url) || null,
      vehiculeTransmission: annonce.vehicule?.boite_vitesse?.nom ?? null,
      vehiculeCarburant: annonce.vehicule?.carburant?.nom ?? null,
      vehiculePlaces: annonce.vehicule?.nombre_places ?? null,
      proprietaireId: annonce.proprietaire_id,
      proprietaireNom: `${annonce.utilisateur.nom ?? ''} ${annonce.utilisateur.prenom ?? ''}`.trim() || null,
      proprietaireTelephone: annonce.utilisateur.telephone || null,
      proprietaireEmail: annonce.utilisateur.email || null,
      tarifJournalier: annonce.tarif_journalier != null ? String(annonce.tarif_journalier) : null,
      description: annonce.description,
      conditions: annonce.conditions,
      caution: annonce.caution != null ? String(annonce.caution) : null,
      kilometrageInclus: annonce.kilometrage_inclus,
      tarifKmSupplementaire:
        annonce.tarif_km_supplementaire != null ? String(annonce.tarif_km_supplementaire) : null,
      statut: annonce.statut,
      actif: annonce.actif,
      createdAt: annonce.created_at,
      updatedAt: annonce.updated_at,
    };
  }

  toReservationResponse(reservation: ReservationRecord): ReservationLocationResponseDto {
    return {
      id: reservation.id,
      annonceLocationId: reservation.annonce_location_id,
      vehiculeMarque: reservation.annonce_location.vehicule?.marque?.nom ?? null,
      vehiculeModele: reservation.annonce_location.vehicule?.modele?.nom ?? null,
      vehiculePhoto: (reservation.annonce_location.vehicule?.photo_vehicule?.find(p => p.est_principale)?.url) || (reservation.annonce_location.vehicule?.photo_vehicule?.[0]?.url) || null,
      locataireId: reservation.locataire_id,
      locataireNom: `${reservation.utilisateur.nom ?? ''} ${reservation.utilisateur.prenom ?? ''}`.trim() || null,
      locataireEmail: reservation.utilisateur.email,
      statut: reservation.statut,
      coutTotal: reservation.cout_total != null ? String(reservation.cout_total) : null,
      caution: reservation.annonce_location.caution != null ? String(reservation.annonce_location.caution) : null,
      dateDebut: reservation.date_debut,
      dateFin: reservation.date_fin,
      dateCreation: reservation.date_creation,
      motifAnnulation: reservation.motif_annulation,
      paiementId: reservation.paiement_id,
      paiementStatut: null,
    };
  }

  toDisponibiliteResponse(row: DisponibiliteRecord): DisponibiliteLocationResponseDto {
    return {
      id: row.id,
      annonceLocationId: row.annonce_location_id,
      date: row.date,
      estDisponible: row.est_disponible,
    };
  }
}

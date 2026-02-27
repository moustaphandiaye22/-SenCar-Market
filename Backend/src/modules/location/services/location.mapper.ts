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
      vehiculeId: annonce.vehiculeId,
      vehiculeMarque: annonce.vehicule?.marque?.nom ?? null,
      vehiculeModele: annonce.vehicule?.modele?.nom ?? null,
      vehiculePhoto: annonce.vehicule?.photos?.[0]?.url ?? null,
      proprietaireId: annonce.proprietaireId,
      proprietaireNom: `${annonce.proprietaire.nom ?? ''} ${annonce.proprietaire.prenom ?? ''}`.trim() || null,
      tarifJournalier: annonce.tarifJournalier != null ? String(annonce.tarifJournalier) : null,
      description: annonce.description,
      conditions: annonce.conditions,
      caution: annonce.caution != null ? String(annonce.caution) : null,
      kilometrageInclus: annonce.kilometrageInclus,
      tarifKmSupplementaire:
        annonce.tarifKmSupplementaire != null ? String(annonce.tarifKmSupplementaire) : null,
      statut: annonce.statut,
      actif: annonce.actif,
      createdAt: annonce.createdAt,
      updatedAt: annonce.updatedAt,
    };
  }

  toReservationResponse(reservation: ReservationRecord): ReservationLocationResponseDto {
    return {
      id: reservation.id,
      annonceLocationId: reservation.annonceLocationId,
      vehiculeMarque: reservation.annonceLocation.vehicule?.marque?.nom ?? null,
      vehiculeModele: reservation.annonceLocation.vehicule?.modele?.nom ?? null,
      locataireId: reservation.locataireId,
      locataireNom: `${reservation.locataire.nom ?? ''} ${reservation.locataire.prenom ?? ''}`.trim() || null,
      locataireEmail: reservation.locataire.email,
      statut: reservation.statut,
      coutTotal: reservation.coutTotal != null ? String(reservation.coutTotal) : null,
      caution: reservation.annonceLocation.caution != null ? String(reservation.annonceLocation.caution) : null,
      dateDebut: reservation.dateDebut,
      dateFin: reservation.dateFin,
      dateCreation: reservation.dateCreation,
      motifAnnulation: reservation.motifAnnulation,
      paiementId: reservation.paiementId,
      paiementStatut: null,
    };
  }

  toDisponibiliteResponse(row: DisponibiliteRecord): DisponibiliteLocationResponseDto {
    return {
      id: row.id,
      annonceLocationId: row.annonceLocationId,
      date: row.date,
      estDisponible: row.estDisponible,
    };
  }
}

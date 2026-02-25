package com.sencarmarket.module.annonce.service;

import com.sencarmarket.module.annonce.dto.AnnonceLocationResponse;
import com.sencarmarket.module.annonce.dto.ReservationLocationResponse;
import com.sencarmarket.module.annonce.entity.AnnonceLocation;
import com.sencarmarket.module.annonce.entity.ReservationLocation;
import org.springframework.stereotype.Service;

@Service
public class AnnonceResponseMapper {

    public AnnonceLocationResponse toAnnonceResponse(AnnonceLocation annonce) {
        return AnnonceLocationResponse.builder()
                .id(annonce.getId())
                .vehiculeId(annonce.getVehicule() != null ? annonce.getVehicule().getId() : null)
                .vehiculeMarque(annonce.getVehicule() != null && annonce.getVehicule().getMarque() != null
                        ? annonce.getVehicule().getMarque().getNom() : null)
                .vehiculeModele(annonce.getVehicule() != null && annonce.getVehicule().getModele() != null
                        ? annonce.getVehicule().getModele().getNom() : null)
                .proprietaireId(annonce.getProprietaire() != null ? annonce.getProprietaire().getId() : null)
                .proprietaireNom(annonce.getProprietaire() != null
                        ? annonce.getProprietaire().getNom() + " " + annonce.getProprietaire().getPrenom() : null)
                .tarifJournalier(annonce.getTarifJournalier())
                .description(annonce.getDescription())
                .conditions(annonce.getConditions())
                .caution(annonce.getCaution())
                .kilometrageInclus(annonce.getKilometrageInclus())
                .tarifKmSupplementaire(annonce.getTarifKmSupplementaire())
                .statut(annonce.getStatut() != null ? annonce.getStatut().name() : null)
                .actif(annonce.getActif())
                .createdAt(annonce.getCreatedAt())
                .updatedAt(annonce.getUpdatedAt())
                .build();
    }

    public ReservationLocationResponse toReservationResponse(ReservationLocation reservation) {
        return ReservationLocationResponse.builder()
                .id(reservation.getId())
                .annonceLocationId(reservation.getAnnonceLocation() != null ? reservation.getAnnonceLocation().getId() : null)
                .vehiculeMarque(reservation.getAnnonceLocation() != null &&
                        reservation.getAnnonceLocation().getVehicule() != null &&
                        reservation.getAnnonceLocation().getVehicule().getMarque() != null
                        ? reservation.getAnnonceLocation().getVehicule().getMarque().getNom() : null)
                .vehiculeModele(reservation.getAnnonceLocation() != null &&
                        reservation.getAnnonceLocation().getVehicule() != null &&
                        reservation.getAnnonceLocation().getVehicule().getModele() != null
                        ? reservation.getAnnonceLocation().getVehicule().getModele().getNom() : null)
                .locataireId(reservation.getLocataire() != null ? reservation.getLocataire().getId() : null)
                .locataireNom(reservation.getLocataire() != null
                        ? reservation.getLocataire().getNom() + " " + reservation.getLocataire().getPrenom() : null)
                .locataireEmail(reservation.getLocataire() != null ? reservation.getLocataire().getEmail() : null)
                .statut(reservation.getStatut() != null ? reservation.getStatut().name() : null)
                .coutTotal(reservation.getCoutTotal())
                .caution(reservation.getAnnonceLocation() != null ? reservation.getAnnonceLocation().getCaution() : null)
                .dateDebut(reservation.getDateDebut())
                .dateFin(reservation.getDateFin())
                .dateCreation(reservation.getDateCreation())
                .motifAnnulation(reservation.getMotifAnnulation())
                .paiementId(reservation.getPaiement() != null ? reservation.getPaiement().getId() : null)
                .build();
    }
}

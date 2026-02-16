package com.sencarmarket.module.annonce.service;

import com.sencarmarket.module.annonce.entity.AnnonceLocation;
import com.sencarmarket.module.annonce.entity.ReservationLocation;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service annonce
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IAnnonceService {

    // Annonce Location
    AnnonceLocation createAnnonceLocation(AnnonceLocation annonce);

    AnnonceLocation updateAnnonceLocation(UUID id, AnnonceLocation annonce);

    void deleteAnnonceLocation(UUID id);

    AnnonceLocation getAnnonceLocationById(UUID id);

    List<AnnonceLocation> getAllAnnoncesLocation();

    List<AnnonceLocation> getAnnoncesLocationByVendeur(UUID vendeurId);

    // Reservation
    ReservationLocation createReservation(ReservationLocation reservation);

    ReservationLocation updateStatutReservation(UUID id, String nouveauStatut);

    void cancelReservation(UUID id);

    ReservationLocation getReservationById(UUID id);

    List<ReservationLocation> getReservationsByLocataire(UUID locataireId);

    List<ReservationLocation> getReservationsByAnnonce(UUID annonceId);
}

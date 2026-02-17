package com.sencarmarket.module.annonce.service;

import com.sencarmarket.module.annonce.dto.*;
import com.sencarmarket.module.annonce.entity.AnnonceLocation;
import com.sencarmarket.module.annonce.entity.DisponibiliteLocation;
import com.sencarmarket.module.annonce.entity.HistoriqueStatutReservation;
import com.sencarmarket.module.annonce.entity.ReservationLocation;
import com.sencarmarket.module.commun.enums.StatutReservation;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service annonce
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IAnnonceService {

    // Annonce Location
    AnnonceLocationResponse createAnnonceLocation(CreateAnnonceLocationRequest request, String userEmail);

    AnnonceLocationResponse updateAnnonceLocation(UUID id, CreateAnnonceLocationRequest request);

    void deleteAnnonceLocation(UUID id);

    AnnonceLocationResponse getAnnonceLocationById(UUID id);

    List<AnnonceLocationResponse> getAllAnnoncesLocation();

    List<AnnonceLocationResponse> getAnnoncesLocationByVendeur(UUID proprietaireId);
    
    List<AnnonceLocationResponse> getMesAnnoncesLocation(String userEmail);

    AnnonceLocationResponse activerDesactiverAnnonce(UUID id, boolean actif);

    // Reservation
    ReservationLocationResponse createReservation(CreateReservationRequest request, String userEmail);

    ReservationLocationResponse updateStatutReservation(UUID id, String nouveauStatut);

    void cancelReservation(UUID id, String motifAnnulation);

    ReservationLocationResponse getReservationById(UUID id);

    List<ReservationLocationResponse> getReservationsByLocataire(UUID locataireId);
    
    List<ReservationLocationResponse> getMesReservations(String userEmail);

    List<ReservationLocationResponse> getReservationsByAnnonce(UUID annonceId);

    // Helper methods
    boolean checkDisponibilite(UUID annonceId, java.time.LocalDateTime dateDebut, java.time.LocalDateTime dateFin);

    java.math.BigDecimal calculateCoutTotal(AnnonceLocation annonce, java.time.LocalDateTime dateDebut, java.time.LocalDateTime dateFin);
    
    // Disponibilités
    List<DisponibiliteLocation> ajouterDisponibilites(UUID annonceId, List<DisponibiliteRequest> disponibilites);
    
    List<DisponibiliteLocation> getDisponibilites(UUID annonceId);
    
    void supprimerDisponibilites(UUID annonceId);
    
    // Historique des statuts
    HistoriqueStatutReservation enregistrerChangementStatut(UUID reservationId, StatutReservation ancienStatut, StatutReservation nouveauStatut);
    
    List<HistoriqueStatutReservation> getHistoriqueStatuts(UUID reservationId);
    
    ReservationLocationResponse updateStatutReservationAvecHistorique(UUID id, String nouveauStatut);
}

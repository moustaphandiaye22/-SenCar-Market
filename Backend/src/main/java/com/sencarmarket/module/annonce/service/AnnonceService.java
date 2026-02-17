package com.sencarmarket.module.annonce.service;

import com.sencarmarket.module.annonce.dto.*;
import com.sencarmarket.module.annonce.entity.AnnonceLocation;
import com.sencarmarket.module.annonce.entity.DisponibiliteLocation;
import com.sencarmarket.module.annonce.entity.HistoriqueStatutReservation;
import com.sencarmarket.module.annonce.entity.ReservationLocation;
import com.sencarmarket.module.commun.enums.StatutReservation;
import com.sencarmarket.module.commun.exception.InvalidStatusException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.commun.exception.ReservationException;
import com.sencarmarket.module.commun.exception.UnauthorizedAccessException;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import com.sencarmarket.module.vehicule.repository.VehiculeRepository;
import com.sencarmarket.module.annonce.repository.AnnonceLocationRepository;
import com.sencarmarket.module.annonce.repository.DisponibiliteLocationRepository;
import com.sencarmarket.module.annonce.repository.HistoriqueStatutReservationRepository;
import com.sencarmarket.module.annonce.repository.ReservationLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnnonceService implements IAnnonceService {

    private final AnnonceLocationRepository annonceLocationRepository;
    private final ReservationLocationRepository reservationLocationRepository;
    private final DisponibiliteLocationRepository disponibiliteLocationRepository;
    private final HistoriqueStatutReservationRepository historiqueStatutReservationRepository;
    private final VehiculeRepository vehiculeRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    @Transactional
    public AnnonceLocationResponse createAnnonceLocation(CreateAnnonceLocationRequest request, String userEmail) {
        log.info("Création d'une annonce de location pour l'utilisateur: {}", userEmail);

        Utilisateur proprietaire = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));

        Vehicule vehicule = vehiculeRepository.findById(request.getVehiculeId())
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", "id", request.getVehiculeId()));

        AnnonceLocation annonce = AnnonceLocation.builder()
                .id(UUID.randomUUID())
                .vehicule(vehicule)
                .proprietaire(proprietaire)
                .tarifJournalier(request.getTarifJournalier())
                .description(request.getDescription())
                .conditions(request.getConditions())
                .caution(request.getCaution())
                .kilometrageInclus(request.getKilometrageInclus())
                .tarifKmSupplementaire(request.getTarifKmSupplementaire())
                .statut(StatutReservation.ACTIF)
                .actif(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        annonceLocationRepository.save(annonce);
        log.info("Annonce de location créée avec succès: ID={}", annonce.getId());

        return mapToAnnonceResponse(annonce);
    }

    @Override
    @Transactional
    public AnnonceLocationResponse updateAnnonceLocation(UUID id, CreateAnnonceLocationRequest request) {
        log.info("Mise à jour de l'annonce de location: {}", id);

        AnnonceLocation annonce = annonceLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AnnonceLocation", "id", id));

        if (request.getTarifJournalier() != null) {
            annonce.setTarifJournalier(request.getTarifJournalier());
        }
        if (request.getDescription() != null) {
            annonce.setDescription(request.getDescription());
        }
        if (request.getConditions() != null) {
            annonce.setConditions(request.getConditions());
        }
        if (request.getCaution() != null) {
            annonce.setCaution(request.getCaution());
        }
        if (request.getKilometrageInclus() != null) {
            annonce.setKilometrageInclus(request.getKilometrageInclus());
        }
        if (request.getTarifKmSupplementaire() != null) {
            annonce.setTarifKmSupplementaire(request.getTarifKmSupplementaire());
        }

        annonce.setUpdatedAt(LocalDateTime.now());
        annonceLocationRepository.save(annonce);

        log.info("Annonce de location mise à jour avec succès: {}", id);
        return mapToAnnonceResponse(annonce);
    }

    @Override
    @Transactional
    public void deleteAnnonceLocation(UUID id) {
        log.info("Suppression de l'annonce de location: {}", id);
        AnnonceLocation annonce = annonceLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AnnonceLocation", "id", id));
        annonceLocationRepository.delete(annonce);
        log.info("Annonce de location supprimée avec succès: {}", id);
    }

    @Override
    public AnnonceLocationResponse getAnnonceLocationById(UUID id) {
        log.debug("Récupération de l'annonce de location par ID: {}", id);
        AnnonceLocation annonce = annonceLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AnnonceLocation", "id", id));
        return mapToAnnonceResponse(annonce);
    }

    @Override
    public List<AnnonceLocationResponse> getAllAnnoncesLocation() {
        log.debug("Récupération de toutes les annonces de location");
        return annonceLocationRepository.findAll().stream()
                .map(this::mapToAnnonceResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AnnonceLocationResponse> getAnnoncesLocationByVendeur(UUID proprietaireId) {
        log.debug("Récupération des annonces de location pour le propriétaire: {}", proprietaireId);
        return annonceLocationRepository.findByProprietaireId(proprietaireId).stream()
                .map(this::mapToAnnonceResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AnnonceLocationResponse> getMesAnnoncesLocation(String userEmail) {
        log.debug("Récupération de mes annonces de location pour l'utilisateur: {}", userEmail);
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));
        return annonceLocationRepository.findByProprietaireId(utilisateur.getId()).stream()
                .map(this::mapToAnnonceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AnnonceLocationResponse activerDesactiverAnnonce(UUID id, boolean actif) {
        log.info("Activation/Désactivation de l'annonce de location: {}", id);
        AnnonceLocation annonce = annonceLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AnnonceLocation", "id", id));
        annonce.setActif(actif);
        annonce.setUpdatedAt(LocalDateTime.now());
        annonceLocationRepository.save(annonce);
        log.info("Annonce de location {} avec succès: {}", actif ? "activée" : "désactivée", id);
        return mapToAnnonceResponse(annonce);
    }

    // Reservation methods

    @Override
    @Transactional
    public ReservationLocationResponse createReservation(CreateReservationRequest request, String userEmail) {
        log.info("Création d'une réservation pour l'utilisateur: {}", userEmail);

        Utilisateur locataire = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));

        AnnonceLocation annonce = annonceLocationRepository.findById(request.getAnnonceLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("AnnonceLocation", "id", request.getAnnonceLocationId()));

        // Vérifier la disponibilité
        if (!checkDisponibilite(annonce.getId(), request.getDateDebut(), request.getDateFin())) {
            throw new ReservationException("Le véhicule n'est pas disponible pour les dates sélectionnées");
        }

        // Vérifier que les dates sont valides
        if (request.getDateDebut().isAfter(request.getDateFin())) {
            throw new ReservationException("La date de début doit être antérieure à la date de fin");
        }

        if (request.getDateDebut().isBefore(LocalDateTime.now())) {
            throw new ReservationException("La date de début ne peut pas être dans le passé");
        }

        // Calculer le coût total
        BigDecimal coutTotal = calculateCoutTotal(annonce, request.getDateDebut(), request.getDateFin());

        ReservationLocation reservation = ReservationLocation.builder()
                .id(UUID.randomUUID())
                .annonceLocation(annonce)
                .locataire(locataire)
                .statut(StatutReservation.EN_ATTENTE)
                .coutTotal(coutTotal)
                .dateDebut(request.getDateDebut())
                .dateFin(request.getDateFin())
                .dateCreation(LocalDateTime.now())
                .build();

        reservationLocationRepository.save(reservation);
        log.info("Réservation créée avec succès: ID={}, Coût total={}", reservation.getId(), coutTotal);

        return mapToReservationResponse(reservation);
    }

    @Override
    @Transactional
    public ReservationLocationResponse updateStatutReservation(UUID id, String nouveauStatut) {
        log.info("Mise à jour du statut de la réservation: {}", id);

        ReservationLocation reservation = reservationLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation", "id", id));

        StatutReservation ancienStatut = reservation.getStatut();
        StatutReservation nouveauStatutEnum = parseStatut(nouveauStatut);

        reservation.setStatut(nouveauStatutEnum);
        reservationLocationRepository.save(reservation);

        log.info("Statut de la réservation mis à jour: {} -> {}", ancienStatut, nouveauStatutEnum);

        return mapToReservationResponse(reservation);
    }

    @Override
    @Transactional
    public void cancelReservation(UUID id, String motifAnnulation) {
        log.info("Annulation de la réservation: {}", id);

        ReservationLocation reservation = reservationLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation", "id", id));

        reservation.setStatut(StatutReservation.ANNULE);
        reservation.setMotifAnnulation(motifAnnulation);
        reservationLocationRepository.save(reservation);

        log.info("Réservation annulée avec succès: {}", id);
    }

    @Override
    public ReservationLocationResponse getReservationById(UUID id) {
        log.debug("Récupération de la réservation par ID: {}", id);
        ReservationLocation reservation = reservationLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation", "id", id));
        return mapToReservationResponse(reservation);
    }

    @Override
    public List<ReservationLocationResponse> getReservationsByLocataire(UUID locataireId) {
        log.debug("Récupération des réservations pour le locataire: {}", locataireId);
        return reservationLocationRepository.findByLocataireId(locataireId).stream()
                .map(this::mapToReservationResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ReservationLocationResponse> getMesReservations(String userEmail) {
        log.debug("Récupération de mes réservations pour l'utilisateur: {}", userEmail);
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", userEmail));
        return reservationLocationRepository.findByLocataireId(utilisateur.getId()).stream()
                .map(this::mapToReservationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReservationLocationResponse> getReservationsByAnnonce(UUID annonceId) {
        log.debug("Récupération des réservations pour l'annonce: {}", annonceId);
        return reservationLocationRepository.findByAnnonceLocationId(annonceId).stream()
                .map(this::mapToReservationResponse)
                .collect(Collectors.toList());
    }

    // Helper methods

    public boolean checkDisponibilite(UUID annonceId, LocalDateTime dateDebut, LocalDateTime dateFin) {
        List<ReservationLocation> reservations = reservationLocationRepository
                .findByAnnonceLocationId(annonceId);

        for (ReservationLocation res : reservations) {
            if (res.getStatut() == StatutReservation.CONFIRME || res.getStatut() == StatutReservation.EN_ATTENTE) {
                // Vérifier le chevauchement des dates
                if (!(dateFin.isBefore(res.getDateDebut()) || dateDebut.isAfter(res.getDateFin()))) {
                    return false;
                }
            }
        }
        return true;
    }

    public BigDecimal calculateCoutTotal(AnnonceLocation annonce, LocalDateTime dateDebut, LocalDateTime dateFin) {
        long jours = Duration.between(dateDebut, dateFin).toDays();
        if (jours == 0) {
            jours = 1; // Minimum 1 jour
        }
        return annonce.getTarifJournalier().multiply(BigDecimal.valueOf(jours));
    }

    private AnnonceLocationResponse mapToAnnonceResponse(AnnonceLocation annonce) {
        return AnnonceLocationResponse.builder()
                .id(annonce.getId())
                .vehiculeId(annonce.getVehicule() != null ? annonce.getVehicule().getId() : null)
                .vehiculeMarque(annonce.getVehicule() != null && annonce.getVehicule().getMarque() != null ? 
                        annonce.getVehicule().getMarque().getNom() : null)
                .vehiculeModele(annonce.getVehicule() != null && annonce.getVehicule().getModele() != null ? 
                        annonce.getVehicule().getModele().getNom() : null)
                .proprietaireId(annonce.getProprietaire() != null ? annonce.getProprietaire().getId() : null)
                .proprietaireNom(annonce.getProprietaire() != null ? 
                        annonce.getProprietaire().getNom() + " " + annonce.getProprietaire().getPrenom() : null)
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

    private ReservationLocationResponse mapToReservationResponse(ReservationLocation reservation) {
        return ReservationLocationResponse.builder()
                .id(reservation.getId())
                .annonceLocationId(reservation.getAnnonceLocation() != null ? reservation.getAnnonceLocation().getId() : null)
                .vehiculeMarque(reservation.getAnnonceLocation() != null && 
                        reservation.getAnnonceLocation().getVehicule() != null &&
                        reservation.getAnnonceLocation().getVehicule().getMarque() != null ?
                        reservation.getAnnonceLocation().getVehicule().getMarque().getNom() : null)
                .vehiculeModele(reservation.getAnnonceLocation() != null && 
                        reservation.getAnnonceLocation().getVehicule() != null &&
                        reservation.getAnnonceLocation().getVehicule().getModele() != null ?
                        reservation.getAnnonceLocation().getVehicule().getModele().getNom() : null)
                .locataireId(reservation.getLocataire() != null ? reservation.getLocataire().getId() : null)
                .locataireNom(reservation.getLocataire() != null ? 
                        reservation.getLocataire().getNom() + " " + reservation.getLocataire().getPrenom() : null)
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
    
    // Méthode helper pour convertir le statut en enum avec validation
    private StatutReservation parseStatut(String statut) {
        if (statut == null || statut.isBlank()) {
            throw new InvalidStatusException("Le statut ne peut pas être nul ou vide", 
                getValidStatutNames());
        }
        try {
            return StatutReservation.valueOf(statut.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new InvalidStatusException(statut, getValidStatutNames());
        }
    }
    
    // Méthode helper pour obtenir les noms des statuts valides
    private String[] getValidStatutNames() {
        java.util.Arrays.stream(StatutReservation.values())
            .map(StatutReservation::name)
            .toArray(String[]::new);
        return java.util.Arrays.stream(StatutReservation.values())
            .map(StatutReservation::name)
            .toArray(String[]::new);
    }
    
    // Méthode helper pour vérifier l'autorisation du propriétaire
    private void verifierProprietaire(Utilisateur utilisateur, AnnonceLocation annonce) {
        if (annonce.getProprietaire() == null || 
            !annonce.getProprietaire().getId().equals(utilisateur.getId())) {
            throw new UnauthorizedAccessException();
        }
    }
    
    // Méthode helper pour vérifier l'autorisation (propriétaire ou locataire)
    private void verifierProprietaireOuLocataire(Utilisateur utilisateur, ReservationLocation reservation) {
        boolean isProprietaire = reservation.getAnnonceLocation() != null && 
            reservation.getAnnonceLocation().getProprietaire() != null &&
            reservation.getAnnonceLocation().getProprietaire().getId().equals(utilisateur.getId());
        boolean isLocataire = reservation.getLocataire() != null &&
            reservation.getLocataire().getId().equals(utilisateur.getId());
        
        if (!isProprietaire && !isLocataire) {
            throw new UnauthorizedAccessException();
        }
    }
    
    // ===== Méthodes de gestion des disponibilités =====
    
    @Override
    @Transactional
    public List<DisponibiliteLocation> ajouterDisponibilites(UUID annonceId, List<DisponibiliteRequest> disponibilites) {
        log.info("Ajout de disponibilités pour l'annonce: {}", annonceId);
        
        AnnonceLocation annonce = annonceLocationRepository.findById(annonceId)
                .orElseThrow(() -> new ResourceNotFoundException("AnnonceLocation", "id", annonceId));
        
        List<DisponibiliteLocation> result = disponibilites.stream()
                .flatMap(d -> d.getDates().stream())
                .map(date -> DisponibiliteLocation.builder()
                        .id(UUID.randomUUID())
                        .annonceLocation(annonce)
                        .date(date)
                        .estDisponible(disponibilites.get(0).getEstDisponible() != null ? disponibilites.get(0).getEstDisponible() : true)
                        .build())
                .collect(Collectors.toList());
        
        disponibiliteLocationRepository.saveAll(result);
        log.info("{} disponibilités ajoutées pour l'annonce: {}", result.size(), annonceId);
        
        return result;
    }
    
    @Override
    @Transactional
    public List<DisponibiliteLocation> getDisponibilites(UUID annonceId) {
        log.debug("Récupération des disponibilités pour l'annonce: {}", annonceId);
        return disponibiliteLocationRepository.findByAnnonceLocationId(annonceId);
    }
    
    @Override
    @Transactional
    public void supprimerDisponibilites(UUID annonceId) {
        log.info("Suppression de toutes les disponibilités pour l'annonce: {}", annonceId);
        disponibiliteLocationRepository.deleteByAnnonceLocationId(annonceId);
        log.info("Disponibilités supprimées pour l'annonce: {}", annonceId);
    }
    
    // ===== Méthodes de gestion de l'historique des statuts =====
    
    @Override
    @Transactional
    public HistoriqueStatutReservation enregistrerChangementStatut(UUID reservationId, StatutReservation ancienStatut, StatutReservation nouveauStatut) {
        log.info("Enregistrement du changement de statut: {} -> {} pour la réservation: {}", 
                ancienStatut, nouveauStatut, reservationId);
        
        ReservationLocation reservation = reservationLocationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation", "id", reservationId));
        
        HistoriqueStatutReservation historique = HistoriqueStatutReservation.builder()
                .id(UUID.randomUUID())
                .reservation(reservation)
                .ancienStatutId(ancienStatut != null ? UUID.nameUUIDFromBytes(ancienStatut.name().getBytes()) : null)
                .nouveauStatutId(UUID.nameUUIDFromBytes(nouveauStatut.name().getBytes()))
                .createdAt(LocalDateTime.now())
                .build();
        
        historiqueStatutReservationRepository.save(historique);
        log.info("Changement de statut enregistré: {}", historique.getId());
        
        return historique;
    }
    
    @Override
    public List<HistoriqueStatutReservation> getHistoriqueStatuts(UUID reservationId) {
        log.debug("Récupération de l'historique des statuts pour la réservation: {}", reservationId);
        return historiqueStatutReservationRepository.findByReservationIdOrderByCreatedAtDesc(reservationId);
    }
    
    // ===== Méthode pour mettre à jour le statut avec historique =====
    
    @Override
    @Transactional
    public ReservationLocationResponse updateStatutReservationAvecHistorique(UUID id, String nouveauStatut) {
        log.info("Mise à jour du statut de la réservation avec historique: {}", id);
        
        ReservationLocation reservation = reservationLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation", "id", id));
        
        StatutReservation ancienStatut = reservation.getStatut();
        StatutReservation nouveauStatutEnum = parseStatut(nouveauStatut);
        
        reservation.setStatut(nouveauStatutEnum);
        reservationLocationRepository.save(reservation);
        
        // Enregistrer l'historique du changement de statut
        enregistrerChangementStatut(id, ancienStatut, nouveauStatutEnum);
        
        log.info("Statut de la réservation mis à jour avec historique: {} -> {}", ancienStatut, nouveauStatutEnum);
        
        return mapToReservationResponse(reservation);
    }
}

package com.sencarmarket.module.annonce.repository;

import com.sencarmarket.module.annonce.entity.ReservationLocation;
import com.sencarmarket.module.commun.enums.StatutReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReservationLocationRepository extends JpaRepository<ReservationLocation, UUID> {

    List<ReservationLocation> findByLocataireId(UUID locataireId);

    List<ReservationLocation> findByVehiculeId(UUID vehiculeId);

    List<ReservationLocation> findByAnnonceLocationId(UUID annonceLocationId);

    List<ReservationLocation> findByStatut(StatutReservation statut);

    boolean existsByAnnonceLocationIdAndDateDebutBeforeAndDateFinAfterAndStatut(
            UUID annonceLocationId, LocalDateTime dateFin, LocalDateTime dateDebut, StatutReservation statut);

    // Méthodes de comptage pour le dashboard admin
    long count();

    long countByStatut(StatutReservation statut);
}

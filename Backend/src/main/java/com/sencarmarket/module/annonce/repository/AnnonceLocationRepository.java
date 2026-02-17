package com.sencarmarket.module.annonce.repository;

import com.sencarmarket.module.annonce.entity.AnnonceLocation;
import com.sencarmarket.module.vehicule.entity.StatutAnnonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnnonceLocationRepository extends JpaRepository<AnnonceLocation, UUID> {

    List<AnnonceLocation> findByVehiculeId(UUID vehiculeId);

    List<AnnonceLocation> findByStatutReservationId(UUID statutReservationId);

    List<AnnonceLocation> findByProprietaireId(UUID proprietaireId);

    List<AnnonceLocation> findByActifTrue();

    List<AnnonceLocation> findByStatut(StatutAnnonce statut);
}

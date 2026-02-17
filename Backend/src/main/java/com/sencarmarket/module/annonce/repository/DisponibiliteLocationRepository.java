package com.sencarmarket.module.annonce.repository;

import com.sencarmarket.module.annonce.entity.DisponibiliteLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface DisponibiliteLocationRepository extends JpaRepository<DisponibiliteLocation, UUID> {
    
    List<DisponibiliteLocation> findByAnnonceLocationId(UUID annonceLocationId);
    
    List<DisponibiliteLocation> findByAnnonceLocationIdAndEstDisponible(UUID annonceLocationId, Boolean estDisponible);
    
    List<DisponibiliteLocation> findByAnnonceLocationIdAndDateBetween(UUID annonceLocationId, LocalDate dateDebut, LocalDate dateFin);
    
    void deleteByAnnonceLocationId(UUID annonceLocationId);
}

package com.sencarmarket.module.garage.repository;

import com.sencarmarket.module.garage.entity.Garage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository pour l'entité Garage
 */
@Repository
public interface GarageRepository extends JpaRepository<Garage, UUID> {

    // Recherche par propriétaire
    List<Garage> findByProprietaireId(UUID proprietaireId);

    // Recherche par ville
    List<Garage> findByVilleIgnoreCase(String ville);

    // Recherche par statut de validation
    List<Garage> findByStatutValidation(Garage.StatutValidation statut);

    // Recherche par statut de validation avec pagination
    Page<Garage> findByStatutValidation(Garage.StatutValidation statut, Pageable pageable);

    // Recherche par ville et statut actif
    @Query("SELECT g FROM Garage g WHERE g.ville = :ville AND g.statutValidation = 'ACTIF'")
    List<Garage> findActiveByVille(@Param("ville") String ville);

    // Recherche garages actifs avec pagination
    Page<Garage> findByStatutValidationEquals(Garage.StatutValidation statut, Pageable pageable);

    // Recherche par proximité (simulé avec bounding box)
    @Query("SELECT g FROM Garage g WHERE g.latitude BETWEEN :minLat AND :maxLat " +
           "AND g.longitude BETWEEN :minLon AND :maxLon " +
           "AND g.statutValidation = 'ACTIF'")
    List<Garage> findByLocation(
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLon") Double minLon,
            @Param("maxLon") Double maxLon
    );

    // Recherche textuelle
    @Query("SELECT g FROM Garage g WHERE LOWER(g.nom) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(g.adresse) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(g.ville) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Garage> search(@Param("query") String query);
}

package com.sencarmarket.module.garage.repository;

import com.sencarmarket.module.garage.entity.GarageServiceAssociation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour l'entité GarageServiceAssociation (association garage-service)
 */
@Repository
public interface GarageServiceRepository extends JpaRepository<GarageServiceAssociation, UUID> {

    // Recherche tous les services d'un garage
    List<GarageServiceAssociation> findByGarageId(UUID garageId);

    // Recherche tous les garages proposant un service
    List<GarageServiceAssociation> findByServiceId(UUID serviceId);

    // Recherche garage-service actif par garage
    List<GarageServiceAssociation> findByGarageIdAndActifTrue(UUID garageId);

    // Vérifier si une association existe déjà
    Optional<GarageServiceAssociation> findByGarageIdAndServiceId(UUID garageId, UUID serviceId);

    // Vérifier si existe avec prix
    @Query("SELECT gs FROM GarageServiceAssociation gs WHERE gs.garage.id = :garageId AND gs.service.id = :serviceId AND gs.actif = true")
    Optional<GarageServiceAssociation> findActiveByGarageAndService(
            @Param("garageId") UUID garageId,
            @Param("serviceId") UUID serviceId
    );

    // Compter les services d'un garage
    long countByGarageId(UUID garageId);
}

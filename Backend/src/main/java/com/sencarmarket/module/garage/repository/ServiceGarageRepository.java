package com.sencarmarket.module.garage.repository;

import com.sencarmarket.module.garage.entity.ServiceGarage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository pour l'entité ServiceGarage
 */
@Repository
public interface ServiceGarageRepository extends JpaRepository<ServiceGarage, UUID> {

    // Recherche par catégorie
    List<ServiceGarage> findByCategorie(ServiceGarage.Categorie categorie);

    // Recherche services actifs
    List<ServiceGarage> findByActifTrue();

    // Recherche par catégorie et actif
    List<ServiceGarage> findByCategorieAndActifTrue(ServiceGarage.Categorie categorie);

    // Recherche par nom (like)
    List<ServiceGarage> findByNomContainingIgnoreCase(String nom);
}

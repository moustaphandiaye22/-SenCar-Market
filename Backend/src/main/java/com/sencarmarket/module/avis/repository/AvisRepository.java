package com.sencarmarket.module.avis.repository;

import com.sencarmarket.module.avis.entity.Avis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository pour l'entité Avis
 */
@Repository
public interface AvisRepository extends JpaRepository<Avis, UUID> {

    // Avis sur un utilisateur
    Page<Avis> findByCibleUtilisateurIdAndStatut(UUID utilisateurId, Avis.StatutAvis statut, Pageable pageable);

    // Avis sur un véhicule
    Page<Avis> findByVehiculeIdAndStatut(UUID vehiculeId, Avis.StatutAvis statut, Pageable pageable);

    // Avis sur un garage
    Page<Avis> findByGarageIdAndStatut(UUID garageId, Avis.StatutAvis statut, Pageable pageable);

    // Notes moyennes
    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.cibleUtilisateur.id = :utilisateurId AND a.statut = 'PUBLIE'")
    Double getNoteMoyenneUtilisateur(@Param("utilisateurId") UUID utilisateurId);

    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.vehicule.id = :vehiculeId AND a.statut = 'PUBLIE'")
    Double getNoteMoyenneVehicule(@Param("vehiculeId") UUID vehiculeId);

    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.garage.id = :garageId AND a.statut = 'PUBLIE'")
    Double getNoteMoyenneGarage(@Param("garageId") UUID garageId);

    // Compter les avis
    long countByCibleUtilisateurIdAndStatut(UUID utilisateurId, Avis.StatutAvis statut);

    // Vérifier si un avis existe déjà pour une transaction
    boolean existsByTransactionIdAndAuteurId(UUID transactionId, UUID auteurId);

    // Avis par transaction
    List<Avis> findByTransactionId(UUID transactionId);
}

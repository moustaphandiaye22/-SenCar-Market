package com.sencarmarket.module.abonnement.repository;

import com.sencarmarket.module.abonnement.entity.UtilisateurAbonnement;
import com.sencarmarket.module.abonnement.enums.StatutAbonnement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour les abonnements des utilisateurs
 */
@Repository
public interface UtilisateurAbonnementRepository extends JpaRepository<UtilisateurAbonnement, UUID> {

    List<UtilisateurAbonnement> findByUtilisateurId(UUID utilisateurId);

    Page<UtilisateurAbonnement> findByUtilisateurId(UUID utilisateurId, Pageable pageable);

    @Query("SELECT ua FROM UtilisateurAbonnement ua WHERE ua.utilisateurId = :utilisateurId AND ua.statut = :statut")
    Optional<UtilisateurAbonnement> findByUtilisateurIdAndStatut(@Param("utilisateurId") UUID utilisateurId, @Param("statut") StatutAbonnement statut);

    @Query("SELECT ua FROM UtilisateurAbonnement ua WHERE ua.utilisateurId = :utilisateurId AND ua.statut = 'ACTIF' AND ua.dateFin > :now")
    Optional<UtilisateurAbonnement> findActiveSubscription(@Param("utilisateurId") UUID utilisateurId, @Param("now") LocalDateTime now);

    @Query("SELECT ua FROM UtilisateurAbonnement ua WHERE ua.statut = 'ACTIF' AND ua.dateFin <= :dateExpiration")
    List<UtilisateurAbonnement> findExpiredSubscriptions(@Param("dateExpiration") LocalDateTime dateExpiration);

    @Query("SELECT ua FROM UtilisateurAbonnement ua WHERE ua.statut = 'ACTIF' AND ua.dateFin > :now AND ua.dateFin <= :endDate")
    List<UtilisateurAbonnement> findExpiringSoon(@Param("now") LocalDateTime now, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(ua) FROM UtilisateurAbonnement ua WHERE ua.statut = 'ACTIF'")
    long countActiveSubscriptions();
}

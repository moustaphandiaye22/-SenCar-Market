package com.sencarmarket.module.abonnement.repository;

import com.sencarmarket.module.abonnement.entity.HistoriqueAbonnement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository pour l'historique des abonnements
 */
@Repository
public interface HistoriqueAbonnementRepository extends JpaRepository<HistoriqueAbonnement, UUID> {

    List<HistoriqueAbonnement> findByUtilisateurIdOrderByDateEvenementDesc(UUID utilisateurId);

    Page<HistoriqueAbonnement> findByUtilisateurId(UUID utilisateurId, Pageable pageable);

    List<HistoriqueAbonnement> findByUtilisateurIdAndTypeEvenement(UUID utilisateurId, HistoriqueAbonnement.TypeEvenementAbonnement typeEvenement);
}

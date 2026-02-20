package com.sencarmarket.module.abonnement.repository;

import com.sencarmarket.module.abonnement.entity.BoostAnnonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository pour les boosts d'annonces
 */
@Repository
public interface BoostAnnonceRepository extends JpaRepository<BoostAnnonce, UUID> {

    List<BoostAnnonce> findByAnnonceLocationId(UUID annonceLocationId);

    List<BoostAnnonce> findByDateFinAfter(LocalDateTime date);

    List<BoostAnnonce> findByAnnonceLocationIdAndDateFinAfter(UUID annonceLocationId, LocalDateTime date);
}

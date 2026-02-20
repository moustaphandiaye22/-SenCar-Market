package com.sencarmarket.module.notification.repository;

import com.sencarmarket.module.notification.entity.Signalement;
import com.sencarmarket.module.notification.enums.StatutTraitementSignalement;
import com.sencarmarket.module.notification.enums.TypeEntiteSignalable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository pour les signalements (Module 11 - Modération)
 */
@Repository
public interface SignalementRepository extends JpaRepository<Signalement, UUID> {

    List<Signalement> findByUtilisateurId(UUID utilisateurId);

    Page<Signalement> findByStatutTraitement(StatutTraitementSignalement statut, Pageable pageable);

    Page<Signalement> findByTypeEntite(TypeEntiteSignalable typeEntite, Pageable pageable);

    @Query("SELECT s FROM Signalement s WHERE s.entiteId = :entiteId AND s.typeEntite = :typeEntite")
    List<Signalement> findByEntite(@Param("entiteId") UUID entiteId, 
                                    @Param("typeEntite") TypeEntiteSignalable typeEntite);

    @Query("SELECT s FROM Signalement s WHERE s.statutTraitement = :statut ORDER BY s.dateSignalement DESC")
    Page<Signalement> findPendingSignalements(@Param("statut") StatutTraitementSignalement statut, 
                                               Pageable pageable);

    @Query("SELECT COUNT(s) FROM Signalement s WHERE s.statutTraitement = :statut")
    long countByStatut(@Param("statut") StatutTraitementSignalement statut);
}

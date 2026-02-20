package com.sencarmarket.module.notification.repository;

import com.sencarmarket.module.notification.entity.Notification;
import com.sencarmarket.module.notification.enums.TypeNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository pour les notifications (Module 12 - Notifications Système)
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUtilisateurIdOrderByDateCreationDesc(UUID utilisateurId);

    Page<Notification> findByUtilisateurId(UUID utilisateurId, Pageable pageable);

    Page<Notification> findByUtilisateurIdAndEstLu(UUID utilisateurId, Boolean estLu, Pageable pageable);

    Page<Notification> findByUtilisateurIdAndType(UUID utilisateurId, TypeNotification type, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.utilisateurId = :utilisateurId AND n.estLu = false")
    long countUnreadByUtilisateur(@Param("utilisateurId") UUID utilisateurId);

    @Query("SELECT n FROM Notification n WHERE n.referenceId = :referenceId AND n.referenceType = :referenceType")
    List<Notification> findByReference(@Param("referenceId") UUID referenceId, 
                                       @Param("referenceType") String referenceType);

    @Query("SELECT n FROM Notification n WHERE n.utilisateurId = :utilisateurId AND n.type IN :types ORDER BY n.dateCreation DESC")
    Page<Notification> findByUtilisateurAndTypes(@Param("utilisateurId") UUID utilisateurId,
                                                   @Param("types") List<TypeNotification> types,
                                                   Pageable pageable);

    void deleteByUtilisateurId(UUID utilisateurId);
}

package com.sencarmarket.module.notification.service;

import com.sencarmarket.module.notification.entity.Notification;
import com.sencarmarket.module.notification.entity.Signalement;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service notification
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface INotificationService {

    // Notification
    Notification createNotification(Notification notification);

    Notification markAsRead(UUID id);

    Notification getNotificationById(UUID id);

    List<Notification> getNotificationsByUtilisateur(UUID utilisateurId);

    List<Notification> getUnreadNotifications(UUID utilisateurId);

    void deleteNotification(UUID id);

    void deleteAllNotifications(UUID utilisateurId);

    // Signalement
    Signalement createSignalement(Signalement signalement);

    Signalement updateStatutSignalement(UUID id, String nouveauStatut);

    Signalement getSignalementById(UUID id);

    List<Signalement> getAllSignalements();

    List<Signalement> getSignalementsByStatut(String statut);

    List<Signalement> getSignalementsByUtilisateur(UUID utilisateurId);
}

package com.sencarmarket.module.notification.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.notification.dto.NotificationResponse;
import com.sencarmarket.module.notification.entity.Notification;
import com.sencarmarket.module.notification.enums.TypeNotification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

/**
 * Façade de notifications qui délègue les responsabilités
 * à des services spécialisés.
 */
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements INotificationService {

    private final NotificationUserService notificationUserService;
    private final NotificationModerationService notificationModerationService;

    @Override
    public Notification createNotification(Notification notification) {
        return notificationUserService.createNotification(notification);
    }

    @Override
    public Notification markAsRead(UUID id) {
        return notificationUserService.markAsRead(id);
    }

    @Override
    public void markAllAsRead(UUID utilisateurId) {
        notificationUserService.markAllAsRead(utilisateurId);
    }

    @Override
    public Notification getNotificationById(UUID id) {
        return notificationUserService.getNotificationById(id);
    }

    @Override
    public PaginatedResponse<NotificationResponse> getNotificationsByUtilisateur(UUID utilisateurId, Pageable pageable) {
        return notificationUserService.getNotificationsByUtilisateur(utilisateurId, pageable);
    }

    @Override
    public PaginatedResponse<NotificationResponse> getUnreadNotifications(UUID utilisateurId, Pageable pageable) {
        return notificationUserService.getUnreadNotifications(utilisateurId, pageable);
    }

    @Override
    public PaginatedResponse<NotificationResponse> getNotificationsByType(UUID utilisateurId, TypeNotification type, Pageable pageable) {
        return notificationUserService.getNotificationsByType(utilisateurId, type, pageable);
    }

    @Override
    public void deleteNotification(UUID id) {
        notificationUserService.deleteNotification(id);
    }

    @Override
    public void deleteAllNotifications(UUID utilisateurId) {
        notificationUserService.deleteAllNotifications(utilisateurId);
    }

    @Override
    public long countUnreadNotifications(UUID utilisateurId) {
        return notificationUserService.countUnreadNotifications(utilisateurId);
    }

    @Override
    public Notification createSignalement(Notification signalementEntity) {
        return notificationModerationService.createSignalement(signalementEntity);
    }

    @Override
    public Notification traiterSignalement(UUID id, String actionAdmin, UUID adminId) {
        return notificationModerationService.traiterSignalement(id, actionAdmin, adminId);
    }

    @Override
    public Notification getSignalementById(UUID id) {
        return notificationModerationService.getSignalementById(id);
    }

    @Override
    public PaginatedResponse<NotificationResponse> getAllSignalements(Pageable pageable) {
        return notificationModerationService.getAllSignalements(pageable);
    }

    @Override
    public PaginatedResponse<NotificationResponse> getPendingSignalements(Pageable pageable) {
        return notificationModerationService.getPendingSignalements(pageable);
    }

    @Override
    public List<Notification> getSignalementsByUtilisateur(UUID utilisateurId) {
        return notificationModerationService.getSignalementsByUtilisateur(utilisateurId);
    }

    @Override
    public UUID notifierTradeIn(UUID utilisateurId, String typeDemande, String statut) {
        return notificationUserService.notifierTradeIn(utilisateurId, typeDemande, statut);
    }

    @Override
    public UUID notifierCertification(UUID utilisateurId, String vehicule, String statut) {
        return notificationUserService.notifierCertification(utilisateurId, vehicule, statut);
    }

    @Override
    public UUID notifierAssurance(UUID utilisateurId, String typeAssurance, String message) {
        return notificationUserService.notifierAssurance(utilisateurId, typeAssurance, message);
    }

    @Override
    public UUID notifierReservation(UUID utilisateurId, String message) {
        return notificationUserService.notifierReservation(utilisateurId, message);
    }

    @Override
    public UUID notifierPaiement(UUID utilisateurId, String message) {
        return notificationUserService.notifierPaiement(utilisateurId, message);
    }

    @Override
    public UUID notifierSubscription(UUID utilisateurId, String type, String message) {
        return notificationUserService.notifierSubscription(utilisateurId, type, message);
    }
}

package com.sencarmarket.module.notification.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.notification.dto.NotificationResponse;
import com.sencarmarket.module.notification.entity.Notification;
import com.sencarmarket.module.notification.enums.TypeNotification;
import com.sencarmarket.module.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationUserService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(Notification notification) {
        if (notification.getDateCreation() == null) {
            notification.setDateCreation(LocalDateTime.now());
        }
        if (notification.getEstLu() == null) {
            notification.setEstLu(false);
        }
        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification markAsRead(UUID id) {
        Notification notification = getNotificationById(id);
        notification.setEstLu(true);
        notification.setDateLecture(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(UUID utilisateurId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByUtilisateurIdOrderByDateCreationDesc(utilisateurId)
                .stream()
                .filter(n -> !n.getEstLu())
                .collect(Collectors.toList());

        if (unreadNotifications.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        unreadNotifications.forEach(notification -> {
            notification.setEstLu(true);
            notification.setDateLecture(now);
        });
        notificationRepository.saveAll(unreadNotifications);
    }

    public Notification getNotificationById(UUID id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
    }

    public PaginatedResponse<NotificationResponse> getNotificationsByUtilisateur(UUID utilisateurId, Pageable pageable) {
        return buildPaginatedResponse(notificationRepository.findByUtilisateurId(utilisateurId, pageable));
    }

    public PaginatedResponse<NotificationResponse> getUnreadNotifications(UUID utilisateurId, Pageable pageable) {
        return buildPaginatedResponse(notificationRepository.findByUtilisateurIdAndEstLu(utilisateurId, false, pageable));
    }

    public PaginatedResponse<NotificationResponse> getNotificationsByType(UUID utilisateurId, TypeNotification type, Pageable pageable) {
        return buildPaginatedResponse(notificationRepository.findByUtilisateurIdAndType(utilisateurId, type, pageable));
    }

    @Transactional
    public void deleteNotification(UUID id) {
        notificationRepository.deleteById(id);
    }

    @Transactional
    public void deleteAllNotifications(UUID utilisateurId) {
        notificationRepository.deleteByUtilisateurId(utilisateurId);
    }

    public long countUnreadNotifications(UUID utilisateurId) {
        return notificationRepository.countUnreadByUtilisateur(utilisateurId);
    }

    public UUID notifierTradeIn(UUID utilisateurId, String typeDemande, String statut) {
        String titre = "Mise à jour de votre demande Trade-In";
        String message = String.format("Votre demande de Trade-In (%s) est maintenant: %s",
                typeDemande, statut);
        return saveNotificationAndReturnId(utilisateurId, titre, message, TypeNotification.TRADE_IN, null, null);
    }

    public UUID notifierCertification(UUID utilisateurId, String vehicule, String statut) {
        String titre = "Mise à jour de votre certification";
        String message = String.format("La certification du véhicule %s est maintenant: %s", vehicule, statut);
        return saveNotificationAndReturnId(utilisateurId, titre, message, TypeNotification.CERTIFICATION, null, null);
    }

    public UUID notifierAssurance(UUID utilisateurId, String typeAssurance, String message) {
        String titre = "Notification assurance";
        String content = String.format("Assurance (%s): %s", typeAssurance, message);
        return saveNotificationAndReturnId(utilisateurId, titre, content, TypeNotification.ASSURANCE, null, null);
    }

    public UUID notifierReservation(UUID utilisateurId, String message) {
        return saveNotificationAndReturnId(
                utilisateurId,
                "Notification réservation",
                message,
                TypeNotification.RESERVATION,
                null,
                null
        );
    }

    public UUID notifierPaiement(UUID utilisateurId, String message) {
        return saveNotificationAndReturnId(
                utilisateurId,
                "Notification paiement",
                message,
                TypeNotification.PAIEMENT,
                null,
                null
        );
    }

    public UUID notifierSubscription(UUID utilisateurId, String type, String message) {
        return saveNotificationAndReturnId(
                utilisateurId,
                "Notification Abonnement",
                message,
                TypeNotification.ABONNEMENT,
                null,
                type
        );
    }

    private UUID saveNotificationAndReturnId(
            UUID utilisateurId,
            String titre,
            String message,
            TypeNotification type,
            UUID referenceId,
            String referenceType
    ) {
        Notification notification = Notification.builder()
                .utilisateurId(utilisateurId)
                .titre(titre)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .estLu(false)
                .dateCreation(LocalDateTime.now())
                .build();
        return notificationRepository.save(notification).getId();
    }

    private PaginatedResponse<NotificationResponse> buildPaginatedResponse(Page<Notification> notificationsPage) {
        List<NotificationResponse> content = notificationsPage.getContent().stream()
                .map(this::toNotificationResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<NotificationResponse>builder()
                .content(content)
                .page(notificationsPage.getNumber())
                .size(notificationsPage.getSize())
                .totalElements(notificationsPage.getTotalElements())
                .totalPages(notificationsPage.getTotalPages())
                .last(notificationsPage.isLast())
                .first(notificationsPage.isFirst())
                .build();
    }

    private NotificationResponse toNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .utilisateurId(notification.getUtilisateurId())
                .titre(notification.getTitre())
                .message(notification.getMessage())
                .type(notification.getType())
                .estLu(notification.getEstLu())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .dateCreation(notification.getDateCreation())
                .dateLecture(notification.getDateLecture())
                .build();
    }
}

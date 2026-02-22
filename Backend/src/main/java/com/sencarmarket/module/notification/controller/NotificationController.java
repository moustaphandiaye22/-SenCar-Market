package com.sencarmarket.module.notification.controller;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.notification.dto.NotificationResponse;
import com.sencarmarket.module.notification.entity.Notification;
import com.sencarmarket.module.notification.enums.TypeNotification;
import com.sencarmarket.module.notification.service.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Contrôleur pour les notifications (Module 12 - Notifications Système)
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final INotificationService notificationService;

    /**
     * Récupérer les notifications d'un utilisateur
     */
    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<PaginatedResponse<NotificationResponse>> getNotificationsByUtilisateur(
            @PathVariable UUID utilisateurId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Récupération des notifications pour l'utilisateur: {}", utilisateurId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateCreation").descending());
        PaginatedResponse<NotificationResponse> notifications = notificationService.getNotificationsByUtilisateur(utilisateurId, pageable);
        
        return ResponseEntity.ok(notifications);
    }

    /**
     * Récupérer les notifications non lues
     */
    @GetMapping("/utilisateur/{utilisateurId}/unread")
    public ResponseEntity<PaginatedResponse<NotificationResponse>> getUnreadNotifications(
            @PathVariable UUID utilisateurId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Récupération des notifications non lues pour l'utilisateur: {}", utilisateurId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateCreation").descending());
        PaginatedResponse<NotificationResponse> notifications = notificationService.getUnreadNotifications(utilisateurId, pageable);
        
        return ResponseEntity.ok(notifications);
    }

    /**
     * Récupérer les notifications par type
     */
    @GetMapping("/utilisateur/{utilisateurId}/type/{type}")
    public ResponseEntity<PaginatedResponse<NotificationResponse>> getNotificationsByType(
            @PathVariable UUID utilisateurId,
            @PathVariable TypeNotification type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Récupération des notifications de type {} pour l'utilisateur: {}", type, utilisateurId);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateCreation").descending());
        PaginatedResponse<NotificationResponse> notifications = notificationService.getNotificationsByType(utilisateurId, type, pageable);
        
        return ResponseEntity.ok(notifications);
    }

    /**
     * Marquer une notification comme lue
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable UUID id) {
        log.info("Marquage de la notification {} comme lue", id);
        
        Notification notification = notificationService.markAsRead(id);
        NotificationResponse response = toResponse(notification);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    @PutMapping("/utilisateur/{utilisateurId}/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@PathVariable UUID utilisateurId) {
        log.info("Marquage de toutes les notifications comme lues pour l'utilisateur: {}", utilisateurId);
        
        notificationService.markAllAsRead(utilisateurId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Toutes les notifications ont été marquées comme lues");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Supprimer une notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable UUID id) {
        log.info("Suppression de la notification: {}", id);
        
        notificationService.deleteNotification(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification supprimée avec succès");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Supprimer toutes les notifications d'un utilisateur
     */
    @DeleteMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<Map<String, String>> deleteAllNotifications(@PathVariable UUID utilisateurId) {
        log.info("Suppression de toutes les notifications pour l'utilisateur: {}", utilisateurId);
        
        notificationService.deleteAllNotifications(utilisateurId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Toutes les notifications ont été supprimées");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Compter les notifications non lues
     */
    @GetMapping("/utilisateur/{utilisateurId}/count/unread")
    public ResponseEntity<Map<String, Long>> countUnread(@PathVariable UUID utilisateurId) {
        long count = notificationService.countUnreadNotifications(utilisateurId);
        
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Récupérer une notification par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponse> getNotificationById(@PathVariable UUID id) {
        log.info("Récupération de la notification: {}", id);
        
        Notification notification = notificationService.getNotificationById(id);
        NotificationResponse response = toResponse(notification);
        
        return ResponseEntity.ok(response);
    }

    // ==================== HELPERS ====================

    private NotificationResponse toResponse(Notification notification) {
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

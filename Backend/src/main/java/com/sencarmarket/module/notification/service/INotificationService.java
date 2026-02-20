package com.sencarmarket.module.notification.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.notification.dto.NotificationResponse;
import com.sencarmarket.module.notification.entity.Notification;
import com.sencarmarket.module.notification.enums.TypeNotification;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service de notifications (Module 12 - Notifications Système)
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface INotificationService {

    // === Notifications (Module 12) ===
    
    /**
     * Crée une notification pour un utilisateur
     */
    Notification createNotification(Notification notification);

    /**
     * Marque une notification comme lue
     */
    Notification markAsRead(UUID id);

    /**
     * Marque toutes les notifications d'un utilisateur comme lues
     */
    void markAllAsRead(UUID utilisateurId);

    /**
     * Récupère une notification par son ID
     */
    Notification getNotificationById(UUID id);

    /**
     * Récupère les notifications d'un utilisateur avec pagination
     */
    PaginatedResponse<NotificationResponse> getNotificationsByUtilisateur(UUID utilisateurId, Pageable pageable);

    /**
     * Récupère les notifications non lues d'un utilisateur
     */
    PaginatedResponse<NotificationResponse> getUnreadNotifications(UUID utilisateurId, Pageable pageable);

    /**
     * Récupère les notifications par type
     */
    PaginatedResponse<NotificationResponse> getNotificationsByType(UUID utilisateurId, TypeNotification type, Pageable pageable);

    /**
     * Supprime une notification
     */
    void deleteNotification(UUID id);

    /**
     * Supprime toutes les notifications d'un utilisateur
     */
    void deleteAllNotifications(UUID utilisateurId);

    /**
     * Compte les notifications non lues
     */
    long countUnreadNotifications(UUID utilisateurId);

    // === Notifications spécifiques ===
    
    /**
     * Notifie pour une demande trade-in
     */
    UUID notifierTradeIn(UUID utilisateurId, String typeDemande, String statut);

    /**
     * Notifie pour une certification
     */
    UUID notifierCertification(UUID utilisateurId, String vehicule, String statut);

    /**
     * Notifie pour une assurance
     */
    UUID notifierAssurance(UUID utilisateurId, String typeAssurance, String message);

    /**
     * Notifie pour une réservation
     */
    UUID notifierReservation(UUID utilisateurId, String message);

    /**
     * Notifie pour un paiement
     */
    UUID notifierPaiement(UUID utilisateurId, String message);

    // === Signalements (Module 11) ===
    
    /**
     * Crée un nouveau signalement
     */
    Notification createSignalement(Notification signalement);

    /**
     * Traite un signalement (action admin)
     */
    Notification traiterSignalement(UUID id, String actionAdmin, UUID adminId);

    /**
     * Récupère un signalement par son ID
     */
    Notification getSignalementById(UUID id);

    /**
     * Récupère tous les signalements avec pagination
     */
    PaginatedResponse<NotificationResponse> getAllSignalements(Pageable pageable);

    /**
     * Récupère les signalements en attente de traitement
     */
    PaginatedResponse<NotificationResponse> getPendingSignalements(Pageable pageable);

    /**
     * Récupère les signalements d'un utilisateur
     */
    List<Notification> getSignalementsByUtilisateur(UUID utilisateurId);

    // === Abonnements ===
    
    /**
     * Notifie pour une subscription
     */
    UUID notifierSubscription(UUID utilisateurId, String type, String message);
}

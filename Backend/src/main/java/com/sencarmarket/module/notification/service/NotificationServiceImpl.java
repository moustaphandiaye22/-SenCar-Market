package com.sencarmarket.module.notification.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.notification.dto.NotificationResponse;
import com.sencarmarket.module.notification.entity.Notification;
import com.sencarmarket.module.notification.entity.Signalement;
import com.sencarmarket.module.notification.enums.StatutTraitementSignalement;
import com.sencarmarket.module.notification.enums.TypeNotification;
import com.sencarmarket.module.notification.repository.NotificationRepository;
import com.sencarmarket.module.notification.repository.SignalementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implémentation du service de notifications (Module 12 - Notifications Système)
 * et de modération (Module 11 - Signalements)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements INotificationService {

    private final NotificationRepository notificationRepository;
    private final SignalementRepository signalementRepository;

    // ==================== NOTIFICATIONS (Module 12) ====================

    @Override
    @Transactional
    public Notification createNotification(Notification notification) {
        log.info("Création d'une notification pour l'utilisateur: {}", notification.getUtilisateurId());
        
        if (notification.getDateCreation() == null) {
            notification.setDateCreation(LocalDateTime.now());
        }
        if (notification.getEstLu() == null) {
            notification.setEstLu(false);
        }
        
        Notification saved = notificationRepository.save(notification);
        log.info("Notification créée avec ID: {}", saved.getId());
        return saved;
    }

    @Override
    @Transactional
    public Notification markAsRead(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification non trouvée: " + id));
        
        notification.setEstLu(true);
        notification.setDateLecture(LocalDateTime.now());
        
        log.info("Notification {} marquée comme lue", id);
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID utilisateurId) {
        log.info("Marquage de toutes les notifications comme lues pour l'utilisateur: {}", utilisateurId);
        List<Notification> unreadNotifications = notificationRepository
                .findByUtilisateurIdOrderByDateCreationDesc(utilisateurId)
                .stream()
                .filter(n -> !n.getEstLu())
                .collect(Collectors.toList());
        
        for (Notification notification : unreadNotifications) {
            notification.setEstLu(true);
            notification.setDateLecture(LocalDateTime.now());
            notificationRepository.save(notification);
        }
        
        log.info("{} notifications marquées comme lues", unreadNotifications.size());
    }

    @Override
    public Notification getNotificationById(UUID id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification non trouvée: " + id));
    }

    @Override
    public PaginatedResponse<NotificationResponse> getNotificationsByUtilisateur(UUID utilisateurId, Pageable pageable) {
        Page<Notification> notificationsPage = notificationRepository.findByUtilisateurId(utilisateurId, pageable);
        return buildPaginatedResponse(notificationsPage);
    }

    @Override
    public PaginatedResponse<NotificationResponse> getUnreadNotifications(UUID utilisateurId, Pageable pageable) {
        Page<Notification> notificationsPage = notificationRepository.findByUtilisateurIdAndEstLu(utilisateurId, false, pageable);
        return buildPaginatedResponse(notificationsPage);
    }

    @Override
    public PaginatedResponse<NotificationResponse> getNotificationsByType(UUID utilisateurId, TypeNotification type, Pageable pageable) {
        Page<Notification> notificationsPage = notificationRepository.findByUtilisateurIdAndType(utilisateurId, type, pageable);
        return buildPaginatedResponse(notificationsPage);
    }

    @Override
    @Transactional
    public void deleteNotification(UUID id) {
        log.info("Suppression de la notification: {}", id);
        notificationRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteAllNotifications(UUID utilisateurId) {
        log.info("Suppression de toutes les notifications pour l'utilisateur: {}", utilisateurId);
        notificationRepository.deleteByUtilisateurId(utilisateurId);
    }

    @Override
    public long countUnreadNotifications(UUID utilisateurId) {
        return notificationRepository.countUnreadByUtilisateur(utilisateurId);
    }

    // ==================== SIGNALEMENTS (Module 11) ====================

    @Override
    @Transactional
    public Notification createSignalement(Notification signalementEntity) {
        log.info("Création d'un signalement pour l'entité");
        
        if (signalementEntity.getDateCreation() == null) {
            signalementEntity.setDateCreation(LocalDateTime.now());
        }
        
        return notificationRepository.save(signalementEntity);
    }

    @Override
    @Transactional
    public Notification traiterSignalement(UUID id, String actionAdmin, UUID adminId) {
        Notification signalement = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Signalement non trouvé: " + id));
        
        signalement.setReferenceType(actionAdmin);
        
        log.info("Signalement {} traité par l'admin {}: {}", id, adminId, actionAdmin);
        return notificationRepository.save(signalement);
    }

    @Override
    public Notification getSignalementById(UUID id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Signalement non trouvé: " + id));
    }

    @Override
    public PaginatedResponse<NotificationResponse> getAllSignalements(Pageable pageable) {
        Page<Notification> signalementsPage = notificationRepository.findAll(pageable);
        return buildPaginatedResponse(signalementsPage);
    }

    @Override
    public PaginatedResponse<NotificationResponse> getPendingSignalements(Pageable pageable) {
        Page<Signalement> signalementsPage = signalementRepository
                .findByStatutTraitement(StatutTraitementSignalement.EN_ATTENTE, pageable);
        
        List<NotificationResponse> content = signalementsPage.getContent().stream()
                .map(this::toSignalementResponse)
                .collect(Collectors.toList());
        
        return PaginatedResponse.<NotificationResponse>builder()
                .content(content)
                .page(signalementsPage.getNumber())
                .size(signalementsPage.getSize())
                .totalElements(signalementsPage.getTotalElements())
                .totalPages(signalementsPage.getTotalPages())
                .last(signalementsPage.isLast())
                .first(signalementsPage.isFirst())
                .build();
    }

    @Override
    public List<Notification> getSignalementsByUtilisateur(UUID utilisateurId) {
        return notificationRepository.findByUtilisateurIdOrderByDateCreationDesc(utilisateurId);
    }

    // ==================== HELPERS ====================

    /**
     * Méthode helper pour construire la réponse paginée
     */
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

    private NotificationResponse toSignalementResponse(Signalement signalement) {
        return NotificationResponse.builder()
                .id(signalement.getId())
                .utilisateurId(signalement.getUtilisateurId())
                .titre("Signalement: " + signalement.getMotif())
                .message(signalement.getDescription())
                .type(TypeNotification.SYSTEM)
                .estLu(false)
                .referenceId(signalement.getEntiteId())
                .referenceType(signalement.getTypeEntite().name())
                .dateCreation(signalement.getDateSignalement())
                .dateLecture(signalement.getDateTraitement())
                .build();
    }

    // ==================== NOTIFICATIONS SPÉCIFIQUES (Module 12) ====================

    /**
     * Notifie pour une demande trade-in
     */
    @Override
    public UUID notifierTradeIn(UUID utilisateurId, String typeDemande, String statut) {
        String titre = "Mise à jour de votre demande Trade-In";
        String message = String.format("Votre demande de Trade-In (%s) est maintenant: %s", 
                typeDemande, statut);
        
        Notification notification = Notification.builder()
                .utilisateurId(utilisateurId)
                .titre(titre)
                .message(message)
                .type(TypeNotification.TRADE_IN)
                .estLu(false)
                .build();
        
        Notification saved = createNotification(notification);
        return saved.getId();
    }

    /**
     * Notifie pour une certification
     */
    @Override
    public UUID notifierCertification(UUID utilisateurId, String vehicule, String statut) {
        String titre = "Mise à jour de votre certification";
        String message = String.format("La certification de votre véhicule (%s) est: %s", 
                vehicule, statut);
        
        Notification notification = Notification.builder()
                .utilisateurId(utilisateurId)
                .titre(titre)
                .message(message)
                .type(TypeNotification.CERTIFICATION)
                .estLu(false)
                .build();
        
        Notification saved = createNotification(notification);
        return saved.getId();
    }

    /**
     * Notifie pour une assurance
     */
    @Override
    public UUID notifierAssurance(UUID utilisateurId, String typeAssurance, String message) {
        String titre = "Notification Assurance";
        
        Notification notification = Notification.builder()
                .utilisateurId(utilisateurId)
                .titre(titre)
                .message(message)
                .type(TypeNotification.ASSURANCE)
                .estLu(false)
                .build();
        
        Notification saved = createNotification(notification);
        return saved.getId();
    }

    /**
     * Notifie pour une réservation
     */
    @Override
    public UUID notifierReservation(UUID utilisateurId, String message) {
        String titre = "Notification Réservation";
        
        Notification notification = Notification.builder()
                .utilisateurId(utilisateurId)
                .titre(titre)
                .message(message)
                .type(TypeNotification.RESERVATION)
                .estLu(false)
                .build();
        
        Notification saved = createNotification(notification);
        return saved.getId();
    }

    /**
     * Notifie pour un paiement
     */
    @Override
    public UUID notifierPaiement(UUID utilisateurId, String message) {
        String titre = "Confirmation de paiement";
        
        Notification notification = Notification.builder()
                .utilisateurId(utilisateurId)
                .titre(titre)
                .message(message)
                .type(TypeNotification.PAIEMENT)
                .estLu(false)
                .build();
        
        Notification saved = createNotification(notification);
        return saved.getId();
    }

    /**
     * Notifie pour une réservation (avec référence)
     */
    public void notifierReservation(UUID utilisateurId, String titre, String message, UUID reservationId) {
        Notification notification = Notification.builder()
                .utilisateurId(utilisateurId)
                .titre(titre)
                .message(message)
                .type(TypeNotification.RESERVATION)
                .referenceId(reservationId)
                .referenceType("RESERVATION")
                .estLu(false)
                .build();
        
        createNotification(notification);
    }

    /**
     * Notifie pour un paiement (avec référence)
     */
    public void notifierPaiement(UUID utilisateurId, String titre, String message, UUID paiementId) {
        Notification notification = Notification.builder()
                .utilisateurId(utilisateurId)
                .titre(titre)
                .message(message)
                .type(TypeNotification.PAIEMENT)
                .referenceId(paiementId)
                .referenceType("PAIEMENT")
                .estLu(false)
                .build();
        
        createNotification(notification);
    }

    /**
     * Notifie pour un nouveau message
     */
    public void notifierMessage(UUID utilisateurId, String expediteurNom, UUID conversationId) {
        Notification notification = Notification.builder()
                .utilisateurId(utilisateurId)
                .titre("Nouveau message")
                .message("Vous avez reçu un message de " + expediteurNom)
                .type(TypeNotification.NOUVEAU_MESSAGE)
                .referenceId(conversationId)
                .referenceType("CONVERSATION")
                .estLu(false)
                .build();
        
        createNotification(notification);
    }

    /**
     * Notifie pour la fin d'un boost
     */
    public void notifierBoostTermine(UUID utilisateurId, String titreAnnonce) {
        Notification notification = Notification.builder()
                .utilisateurId(utilisateurId)
                .titre("Boost terminé")
                .message("Votre boost pour l'annonce '" + titreAnnonce + "' est terminé")
                .type(TypeNotification.BOOST_TERMINEE)
                .estLu(false)
                .build();
        
        createNotification(notification);
    }

    /**
     * Notifie pour une subscription acceptée
     */
    public void notifierSouscriptionAcceptee(UUID utilisateurId, String typeAbonnement) {
        Notification notification = Notification.builder()
                .utilisateurId(utilisateurId)
                .titre("Souscription acceptée")
                .message("Votre abonnement " + typeAbonnement + " a été activé avec succès")
                .type(TypeNotification.SOUSCRIPTION_ACCEPTEE)
                .estLu(false)
                .build();
        
        createNotification(notification);
    }
}

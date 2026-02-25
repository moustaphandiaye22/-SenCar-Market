package com.sencarmarket.module.notification.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.notification.dto.NotificationResponse;
import com.sencarmarket.module.notification.entity.Notification;
import com.sencarmarket.module.notification.entity.Signalement;
import com.sencarmarket.module.notification.enums.StatutTraitementSignalement;
import com.sencarmarket.module.notification.enums.TypeNotification;
import com.sencarmarket.module.notification.repository.NotificationRepository;
import com.sencarmarket.module.notification.repository.SignalementRepository;
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
public class NotificationModerationService {

    private final NotificationRepository notificationRepository;
    private final SignalementRepository signalementRepository;

    @Transactional
    public Notification createSignalement(Notification signalementEntity) {
        if (signalementEntity.getDateCreation() == null) {
            signalementEntity.setDateCreation(LocalDateTime.now());
        }
        return notificationRepository.save(signalementEntity);
    }

    @Transactional
    public Notification traiterSignalement(UUID id, String actionAdmin, UUID adminId) {
        Notification signalement = getSignalementById(id);
        signalement.setReferenceType(actionAdmin);
        return notificationRepository.save(signalement);
    }

    public Notification getSignalementById(UUID id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement", "id", id));
    }

    public PaginatedResponse<NotificationResponse> getAllSignalements(Pageable pageable) {
        Page<Notification> signalementsPage = notificationRepository.findAll(pageable);
        return buildPaginatedResponse(signalementsPage);
    }

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

    public List<Notification> getSignalementsByUtilisateur(UUID utilisateurId) {
        return notificationRepository.findByUtilisateurIdOrderByDateCreationDesc(utilisateurId);
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
}

package com.sencarmarket.module.notification.mapper;

import com.sencarmarket.module.notification.dto.NotificationResponse;
import com.sencarmarket.module.notification.dto.SignalementResponse;
import com.sencarmarket.module.notification.entity.Notification;
import com.sencarmarket.module.notification.entity.Signalement;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour les conversions Notification/Signalement - Respecte SRP et DRY
 */
@Component
public class NotificationMapper {

    public NotificationResponse toNotificationResponse(Notification notification) {
        if (notification == null) {
            return null;
        }
        
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

    public List<NotificationResponse> toNotificationResponseList(List<Notification> notifications) {
        return notifications.stream()
                .map(this::toNotificationResponse)
                .collect(Collectors.toList());
    }

    public SignalementResponse toSignalementResponse(Signalement signalement) {
        if (signalement == null) {
            return null;
        }
        
        return SignalementResponse.builder()
                .id(signalement.getId())
                .utilisateurId(signalement.getUtilisateurId())
                .typeEntite(signalement.getTypeEntite())
                .entiteId(signalement.getEntiteId())
                .motif(signalement.getMotif())
                .description(signalement.getDescription())
                .statutTraitement(signalement.getStatutTraitement())
                .actionAdmin(signalement.getActionAdmin())
                .adminId(signalement.getAdminId())
                .dateTraitement(signalement.getDateTraitement())
                .dateSignalement(signalement.getDateSignalement())
                .build();
    }

    public List<SignalementResponse> toSignalementResponseList(List<Signalement> signalements) {
        return signalements.stream()
                .map(this::toSignalementResponse)
                .collect(Collectors.toList());
    }
}

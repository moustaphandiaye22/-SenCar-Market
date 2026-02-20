package com.sencarmarket.module.notification.dto;

import com.sencarmarket.module.notification.enums.TypeNotification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour la réponse d'une notification (Module 12 - Notifications)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID id;
    private UUID utilisateurId;
    private String titre;
    private String message;
    private TypeNotification type;
    private Boolean estLu;
    private UUID referenceId;
    private String referenceType;
    private LocalDateTime dateCreation;
    private LocalDateTime dateLecture;
}

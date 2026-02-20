package com.sencarmarket.module.messagerie.dto;

import com.sencarmarket.module.messagerie.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour la réponse d'un message
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private UUID id;
    private UUID conversationId;
    private UUID utilisateurId;
    private String utilisateurNom;
    private String contenu;
    private LocalDateTime dateEnvoi;
    private LocalDateTime dateLecture;
    private Boolean estLu;
    private Boolean estEpingle;
    private String typeMessage;

    public static MessageResponse fromEntity(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation() != null ? message.getConversation().getId() : null)
                .utilisateurId(message.getUtilisateur() != null ? message.getUtilisateur().getId() : null)
                .utilisateurNom(message.getUtilisateur() != null ? message.getUtilisateur().getNom() : null)
                .contenu(message.getContenu())
                .dateEnvoi(message.getDateEnvoi())
                .dateLecture(message.getDateLecture())
                .estLu(message.getEstLu())
                .estEpingle(message.getEstEpingle())
                .typeMessage(message.getTypeMessage())
                .build();
    }
}

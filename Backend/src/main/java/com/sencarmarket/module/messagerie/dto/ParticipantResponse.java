package com.sencarmarket.module.messagerie.dto;

import com.sencarmarket.module.messagerie.entity.ConversationParticipant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour la réponse d'un participant
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantResponse {

    private UUID id;
    private UUID utilisateurId;
    private String utilisateurNom;
    private String utilisateurPhotoUrl;
    private LocalDateTime dateJoin;
    private Boolean estAdmin;
    private Boolean estMute;
    private Integer nombreNonLus;

    public static ParticipantResponse fromEntity(ConversationParticipant participant) {
        return ParticipantResponse.builder()
                .id(participant.getId())
                .utilisateurId(participant.getUtilisateur() != null ? participant.getUtilisateur().getId() : null)
                .utilisateurNom(participant.getUtilisateur() != null ? participant.getUtilisateur().getNom() : null)
                .dateJoin(participant.getDateJoin())
                .estAdmin(participant.getEstAdmin())
                .estMute(participant.getEstMute())
                .nombreNonLus(participant.getNombreNonLus())
                .build();
    }
}

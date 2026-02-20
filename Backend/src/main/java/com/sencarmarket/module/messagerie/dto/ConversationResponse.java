package com.sencarmarket.module.messagerie.dto;

import com.sencarmarket.module.messagerie.entity.Conversation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO pour la réponse d'une conversation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {

    private UUID id;
    private String titre;
    private String avatarUrl;
    private String typeConversation;
    private UUID annonceId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Dernier message
    private MessageResponse dernierMessage;
    
    // Participants
    private List<ParticipantResponse> participants;
    
    // Nombre de messages non lus
    private Integer nombreNonLus;

    public static ConversationResponse fromEntity(Conversation conversation) {
        return ConversationResponse.builder()
                .id(conversation.getId())
                .titre(conversation.getTitre())
                .avatarUrl(conversation.getAvatarUrl())
                .typeConversation(conversation.getTypeConversation() != null ? 
                        conversation.getTypeConversation().name() : null)
                .annonceId(conversation.getAnnonceId())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .nombreNonLus(conversation.getNombreMessagesNonLus())
                .build();
    }
}

package com.sencarmarket.module.messagerie.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO pour créer une conversation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {

    @NotBlank(message = "Le titre est requis pour les conversations de groupe")
    private String titre;

    @NotNull(message = "Le type de conversation est requis")
    private String typeConversation; // DIRECT ou GROUP

    private UUID annonceId;

    // Pour les conversations directes, l'ID du deuxième utilisateur
    private UUID autreUtilisateurId;

    // IDs des utilisateurs à ajouter (pour les conversations de groupe)
    private java.util.List<UUID> participantIds;
}

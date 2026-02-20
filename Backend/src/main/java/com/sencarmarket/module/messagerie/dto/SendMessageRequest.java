package com.sencarmarket.module.messagerie.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO pour envoyer un message
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    @NotNull(message = "L'ID de la conversation est requis")
    private UUID conversationId;

    @NotBlank(message = "Le contenu du message est requis")
    private String contenu;

    private String typeMessage; // TEXTE, IMAGE
}

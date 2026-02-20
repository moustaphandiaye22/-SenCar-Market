package com.sencarmarket.module.avis.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO pour créer un avis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAvisRequest {

    @NotNull(message = "Le type d'avis est requis")
    private String typeAvis;

    @NotNull(message = "L'ID de transaction est requis")
    private UUID transactionId;

    // Cible de l'avis (un des trois doit être rempli)
    private UUID cibleUtilisateurId;
    private UUID vehiculeId;
    private UUID garageId;

    @NotNull(message = "La note est requise")
    @Min(value = 1, message = "La note minimum est 1")
    @Max(value = 5, message = "La note maximum est 5")
    private Integer note;

    @Size(max = 1000, message = "Le commentaire ne peut pas dépasser 1000 caractères")
    private String commentaire;
}

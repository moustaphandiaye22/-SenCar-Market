package com.sencarmarket.module.abonnement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBoostRequest {

    @NotNull(message = "L'ID de l'annonce est requis")
    private UUID annonceLocationId;

    @NotNull(message = "La date de début est requise")
    private LocalDateTime dateDebut;

    @NotNull(message = "La date de fin est requise")
    private LocalDateTime dateFin;

    @NotBlank(message = "Le niveau de boost est requis")
    private String niveauBoost;
}

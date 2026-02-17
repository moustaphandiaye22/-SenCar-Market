package com.sencarmarket.module.annonce.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisponibiliteRequest {

    @NotNull(message = "L'ID de l'annonce est requis")
    private UUID annonceLocationId;

    private List<LocalDate> dates;
    private Boolean estDisponible;
}

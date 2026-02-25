package com.sencarmarket.module.abonnement.dto;

import com.sencarmarket.module.abonnement.entity.BoostAnnonce;
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
public class BoostAnnonceResponse {

    private UUID id;
    private UUID annonceLocationId;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String niveauBoost;

    public static BoostAnnonceResponse fromEntity(BoostAnnonce boost) {
        return BoostAnnonceResponse.builder()
                .id(boost.getId())
                .annonceLocationId(boost.getAnnonceLocationId())
                .dateDebut(boost.getDateDebut())
                .dateFin(boost.getDateFin())
                .niveauBoost(boost.getNiveauBoost())
                .build();
    }
}

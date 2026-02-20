package com.sencarmarket.module.abonnement.dto;

import com.sencarmarket.module.abonnement.entity.UtilisateurAbonnement;
import com.sencarmarket.module.abonnement.enums.StatutAbonnement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour la réponse d'un abonnement utilisateur
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurAbonnementResponse {

    private UUID id;
    private UUID utilisateurId;
    private UUID abonnementId;
    private String abonnementNom;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private StatutAbonnement statut;
    private Integer nombreAnnoncesUtilisees;
    private Integer nombreAnnoncesRestantes;

    public static UtilisateurAbonnementResponse fromEntity(UtilisateurAbonnement ua) {
        return UtilisateurAbonnementResponse.builder()
                .id(ua.getId())
                .utilisateurId(ua.getUtilisateurId())
                .abonnementId(ua.getAbonnementId())
                .dateDebut(ua.getDateDebut())
                .dateFin(ua.getDateFin())
                .statut(ua.getStatut())
                .nombreAnnoncesUtilisees(ua.getNombreAnnoncesUtilisees())
                .build();
    }
}

package com.sencarmarket.module.avis.dto;

import com.sencarmarket.module.avis.entity.Avis;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour la réponse d'un avis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvisResponse {

    private UUID id;
    private UUID auteurId;
    private String auteurNom;
    private String auteurPrenom;
    private UUID cibleUtilisateurId;
    private UUID vehiculeId;
    private UUID garageId;
    private String typeAvis;
    private UUID transactionId;
    private Integer note;
    private String commentaire;
    private String statut;
    private LocalDateTime createdAt;

    public static AvisResponse fromEntity(Avis avis) {
        return AvisResponse.builder()
                .id(avis.getId())
                .auteurId(avis.getAuteur() != null ? avis.getAuteur().getId() : null)
                .auteurNom(avis.getAuteur() != null ? avis.getAuteur().getNom() : null)
                .auteurPrenom(avis.getAuteur() != null ? avis.getAuteur().getPrenom() : null)
                .cibleUtilisateurId(avis.getCibleUtilisateur() != null ? avis.getCibleUtilisateur().getId() : null)
                .vehiculeId(avis.getVehicule() != null ? avis.getVehicule().getId() : null)
                .garageId(avis.getGarage() != null ? avis.getGarage().getId() : null)
                .typeAvis(avis.getTypeAvis() != null ? avis.getTypeAvis().name() : null)
                .transactionId(avis.getTransactionId())
                .note(avis.getNote())
                .commentaire(avis.getCommentaire())
                .statut(avis.getStatut() != null ? avis.getStatut().name() : null)
                .createdAt(avis.getCreatedAt())
                .build();
    }
}

package com.sencarmarket.module.abonnement.dto;

import com.sencarmarket.module.abonnement.entity.Abonnement;
import com.sencarmarket.module.abonnement.enums.TypeAbonnement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO pour la réponse d'un abonnement
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbonnementResponse {

    private UUID id;
    private String nom;
    private String description;
    private BigDecimal prixMensuel;
    private Integer dureeJours;
    private Integer nombreAnnonces;
    private Boolean estVedette;
    private Boolean estCertifie;
    private TypeAbonnement type;

    public static AbonnementResponse fromEntity(Abonnement abonnement) {
        return AbonnementResponse.builder()
                .id(abonnement.getId())
                .nom(abonnement.getNom())
                .description(abonnement.getDescription())
                .prixMensuel(abonnement.getPrixMensuel())
                .dureeJours(abonnement.getDureeJours())
                .nombreAnnonces(abonnement.getNombreAnnonces())
                .estVedette(abonnement.getEstVedette())
                .estCertifie(abonnement.getEstCertifie())
                .type(abonnement.getType())
                .build();
    }
}

package com.sencarmarket.module.annonce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationLocationResponse {

    private UUID id;
    private UUID annonceLocationId;
    private String vehiculeMarque;
    private String vehiculeModele;
    private UUID locataireId;
    private String locataireNom;
    private String locataireEmail;
    private String statut;
    private BigDecimal coutTotal;
    private BigDecimal caution;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private LocalDateTime dateCreation;
    private String motifAnnulation;
    private UUID paiementId;
    private String paiementStatut;
}

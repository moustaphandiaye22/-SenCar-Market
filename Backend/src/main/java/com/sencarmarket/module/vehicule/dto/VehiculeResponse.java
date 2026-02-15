package com.sencarmarket.module.vehicule.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehiculeResponse {
    private UUID id;
    private String marque;
    private String modele;
    private Integer anneeFabrication;
    private Integer kilometrage;
    private String carburant;
    private String boiteVitesse;
    private String couleur;
    private BigDecimal prixVente;
    private String description;
    private String numeroVin;
    private String immatriculation;
    private String statut;
    private Boolean prixNegociable;
    private Boolean certifie;
    private List<String> photosUrls;
    private Boolean estBoost;
    private LocalDateTime boostDebut;
    private LocalDateTime boostFin;
    private Integer vues;
    private Boolean estFavori;
    private String vendeurNom;
    private LocalDateTime createdAt;
}

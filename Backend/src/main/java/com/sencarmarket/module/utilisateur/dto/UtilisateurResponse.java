package com.sencarmarket.module.utilisateur.dto;

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
public class UtilisateurResponse {
    private UUID id;
    private String email;
    private String telephone;
    private String prenom;
    private String nom;
    private String photoProfilUrl;
    private Boolean emailVerifie;
    private Boolean telephoneVerifie;
    private Boolean doubleAuthActive;
    private String typeUtilisateur;
    private String statutVerification;
    private LocalDateTime createdAt;
}

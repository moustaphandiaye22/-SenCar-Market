package com.sencarmarket.module.utilisateur.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "utilisateur")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "telephone", unique = true, nullable = false)
    private String telephone;

    @Column(name = "mot_de_passe_hash", nullable = false)
    private String motDePasseHash;

    @Column(name = "prenom")
    private String prenom;

    @Column(name = "nom")
    private String nom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_utilisateur_id")
    private TypeUtilisateur typeUtilisateur;

    @Column(name = "statut_verification")
    private String statutVerification;

    @Column(name = "photo_profil_url")
    private String photoProfilUrl;

    @Column(name = "email_verifie")
    private Boolean emailVerifie;

    @Column(name = "telephone_verifie")
    private Boolean telephoneVerifie;

    @Column(name = "note_moyenne", precision = 3, scale = 2)
    private java.math.BigDecimal noteMoyenne;

    @Column(name = "nombre_total_avis")
    private Integer nombreTotalAvis;

    @Column(name = "double_auth_active")
    private Boolean doubleAuthActive;

    @Column(name = "derniere_connexion")
    private LocalDateTime DerniereConnexion;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

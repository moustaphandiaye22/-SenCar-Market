package com.sencarmarket.module.abonnement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "abonnement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Abonnement {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "nom")
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "prix_mensuel", precision = 12, scale = 2)
    private BigDecimal prixMensuel;

    @Column(name = "duree_jours")
    private Integer dureeJours;

    @Column(name = "nombre_annonces")
    private Integer nombreAnnonces;

    @Column(name = "est_vedette")
    private Boolean estVedette;

    @Column(name = "est_certifie")
    private Boolean estCertifie;
}

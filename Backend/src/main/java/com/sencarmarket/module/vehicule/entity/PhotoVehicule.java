package com.sencarmarket.module.vehicule.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "photo_vehicule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoVehicule {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;

    @Column(name = "url")
    private String url;

    @Column(name = "est_principale")
    private Boolean estPrincipale;

    @Column(name = "ordre")
    private Integer ordre;
}

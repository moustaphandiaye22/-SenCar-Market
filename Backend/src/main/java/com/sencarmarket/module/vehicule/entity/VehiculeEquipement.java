package com.sencarmarket.module.vehicule.entity;

import com.sencarmarket.module.vehicule.entity.Equipement;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "vehicule_equipement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehiculeEquipement {

    @Id
    @Column(name = "vehicule_id", nullable = false)
    private UUID vehiculeId;

    @Id
    @Column(name = "equipement_id", nullable = false)
    private UUID equipementId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Vehicule vehicule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipement_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Equipement equipement;
}

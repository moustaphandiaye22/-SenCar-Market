package com.sencarmarket.module.paiement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "paiement_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaiementLog {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "paiement_id")
    private UUID paiementId;

    @Column(name = "action")
    private String action;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "date_action")
    private LocalDateTime dateAction;
}

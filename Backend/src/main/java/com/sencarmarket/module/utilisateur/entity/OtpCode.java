package com.sencarmarket.module.utilisateur.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "otp_code")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpCode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "code", nullable = false, length = 6)
    private String code;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private OtpType type;

    @Column(name = "expiration", nullable = false)
    private LocalDateTime expiration;

    @Column(name = "utilise", nullable = false)
    private Boolean utilise;

    @Column(name = "tentatives", nullable = false)
    private Integer tentatives;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (utilise == null) {
            utilise = false;
        }
        if (tentatives == null) {
            tentatives = 0;
        }
    }

    public enum OtpType {
        INSCRIPTION,
        CONNEXION,
        MOT_DE_PASSE_OUBLIE,
        VERIFICATION_EMAIL,
        VERIFICATION_TELEPHONE
    }
}

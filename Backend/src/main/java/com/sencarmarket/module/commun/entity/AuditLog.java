package com.sencarmarket.module.commun.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entité pour journaliser les opérations sensibles (audit trail)
 */
@Entity
@Table(name = "audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "utilisateur_id")
    private UUID utilisateurId;

    @Column(name = "utilisateur_email")
    private String utilisateurEmail;

    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "type_entite")
    private String typeEntite;

    @Column(name = "id_entite")
    private UUID idEntite;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "adresse_ip")
    private String adresseIp;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "statut")
    private String statut; // SUCCESS, FAILURE

    @Column(name = "message_erreur")
    private String messageErreur;

    @Column(name = "date_action", nullable = false)
    private LocalDateTime dateAction;

    @PrePersist
    protected void onCreate() {
        if (dateAction == null) {
            dateAction = LocalDateTime.now();
        }
    }

    /**
     * Types d'actions journalisées
     */
    public static class Actions {
        public static final String LOGIN = "LOGIN";
        public static final String LOGOUT = "LOGOUT";
        public static final String LOGIN_FAILED = "LOGIN_FAILED";
        public static final String REGISTER = "REGISTER";
        public static final String PASSWORD_CHANGE = "PASSWORD_CHANGE";
        public static final String PASSWORD_RESET = "PASSWORD_RESET";
        public static final String PROFILE_UPDATE = "PROFILE_UPDATE";
        public static final String VEHICULE_CREATE = "VEHICULE_CREATE";
        public static final String VEHICULE_UPDATE = "VEHICULE_UPDATE";
        public static final String VEHICULE_DELETE = "VEHICULE_DELETE";
        public static final String VEHICULE_PUBLISH = "VEHICULE_PUBLISH";
        public static final String PAIEMENT_CREATE = "PAIEMENT_CREATE";
        public static final String PAIEMENT_CONFIRM = "PAIEMENT_CONFIRM";
        public static final String PAIEMENT_CANCEL = "PAIEMENT_CANCEL";
        public static final String PAIEMENT_REFUND = "PAIEMENT_REFUND";
        public static final String ESCROW_RELEASE = "ESCROW_RELEASE";
        public static final String ABONNEMENT_CREATE = "ABONNEMENT_CREATE";
        public static final String ABONNEMENT_CANCEL = "ABONNEMENT_CANCEL";
        public static final String ADMIN_USER_CREATE = "ADMIN_USER_CREATE";
        public static final String ADMIN_USER_UPDATE = "ADMIN_USER_UPDATE";
        public static final String ADMIN_USER_DELETE = "ADMIN_USER_DELETE";
        public static final String ADMIN_ROLE_CHANGE = "ADMIN_ROLE_CHANGE";
        public static final String SIGNALEMENT_CREATE = "SIGNALEMENT_CREATE";
        public static final String SIGNALEMENT_TREATE = "SIGNALEMENT_TREATE";
        public static final String CERTIFICATION_REQUEST = "CERTIFICATION_REQUEST";
        public static final String CERTIFICATION_APPROVE = "CERTIFICATION_APPROVE";
        public static final String RESERVATION_CREATE = "RESERVATION_CREATE";
        public static final String RESERVATION_CANCEL = "RESERVATION_CANCEL";
    }
}

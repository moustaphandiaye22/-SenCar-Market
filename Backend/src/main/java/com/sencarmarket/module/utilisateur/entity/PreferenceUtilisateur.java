package com.sencarmarket.module.utilisateur.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "preference_utilisateur")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreferenceUtilisateur {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    @Column(name = "langue")
    private String langue;

    @Column(name = "devise")
    private String devise;

    @Column(name = "notif_email")
    private Boolean notifEmail;

    @Column(name = "notif_sms")
    private Boolean notifSms;

    @Column(name = "notif_push")
    private Boolean notifPush;
}

package com.sencarmarket.module.admin.service;

import com.sencarmarket.module.notification.service.INotificationService;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminNotificationService {

    private final INotificationService notificationService;

    public void notifyUtilisateur(UUID utilisateurId, String type, String message) {
        notificationService.notifierSubscription(utilisateurId, type, message);
    }

    public void notifyVendeurIfPresent(UUID proprietaireId, String type, String message) {
        if (proprietaireId != null) {
            notificationService.notifierSubscription(proprietaireId, type, message);
        }
    }

    public void notifyAll(List<Utilisateur> utilisateurs, String message) {
        utilisateurs.forEach(u -> notificationService.notifierSubscription(u.getId(), "MESSAGE", message));
    }

    public void notifyGroup(List<UUID> utilisateurIds, String message) {
        utilisateurIds.forEach(id -> notificationService.notifierSubscription(id, "MESSAGE", message));
    }

    public void notifyPaiement(UUID portefeuilleId, String message) {
        notificationService.notifierPaiement(portefeuilleId, message);
    }
}

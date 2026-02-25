package com.sencarmarket.module.abonnement.service;

import com.sencarmarket.module.abonnement.entity.Abonnement;
import com.sencarmarket.module.abonnement.entity.UtilisateurAbonnement;
import com.sencarmarket.module.abonnement.enums.StatutAbonnement;
import com.sencarmarket.module.abonnement.repository.UtilisateurAbonnementRepository;
import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionLifecycleService {

    private final UtilisateurAbonnementRepository utilisateurAbonnementRepository;

    public void ensureNoActiveSubscription(UUID utilisateurId) {
        boolean hasActive = utilisateurAbonnementRepository
                .findActiveSubscription(utilisateurId, LocalDateTime.now())
                .isPresent();
        if (hasActive) {
            throw new InvalidOperationException(AppMessages.SUBSCRIPTION_ALREADY_ACTIVE);
        }
    }

    public UtilisateurAbonnement createActiveSubscription(UUID utilisateurId, Abonnement abonnement) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dateFin = now.plusDays(abonnement.getDureeJours());
        return UtilisateurAbonnement.builder()
                .utilisateurId(utilisateurId)
                .abonnementId(abonnement.getId())
                .dateDebut(now)
                .dateFin(dateFin)
                .statut(StatutAbonnement.ACTIF)
                .nombreAnnoncesUtilisees(0)
                .build();
    }

    public UtilisateurAbonnement getActiveSubscriptionOrThrow(UUID utilisateurId) {
        return utilisateurAbonnementRepository.findActiveSubscription(utilisateurId, LocalDateTime.now())
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.NO_ACTIVE_SUBSCRIPTION));
    }

    public void renew(UtilisateurAbonnement subscription, Abonnement abonnement) {
        LocalDateTime newDateFin = subscription.getDateFin().plusDays(abonnement.getDureeJours());
        subscription.setDateFin(newDateFin);
        subscription.setStatut(StatutAbonnement.ACTIF);
    }

    public void cancel(UtilisateurAbonnement subscription) {
        subscription.setStatut(StatutAbonnement.ANNULE);
    }

    public int expireDueSubscriptions() {
        List<UtilisateurAbonnement> expiredSubscriptions = utilisateurAbonnementRepository
                .findExpiredSubscriptions(LocalDateTime.now());

        for (UtilisateurAbonnement subscription : expiredSubscriptions) {
            subscription.setStatut(StatutAbonnement.EXPIRE);
            utilisateurAbonnementRepository.save(subscription);
        }
        return expiredSubscriptions.size();
    }

    public boolean canPostAnnonce(UtilisateurAbonnement subscription, Abonnement abonnement) {
        int used = subscription.getNombreAnnoncesUtilisees() != null ? subscription.getNombreAnnoncesUtilisees() : 0;
        int allowed = abonnement.getNombreAnnonces() != null ? abonnement.getNombreAnnonces() : 0;
        return used < allowed;
    }

    public void incrementUsedAnnonces(UtilisateurAbonnement subscription) {
        int current = subscription.getNombreAnnoncesUtilisees() != null ? subscription.getNombreAnnoncesUtilisees() : 0;
        subscription.setNombreAnnoncesUtilisees(current + 1);
    }
}

package com.sencarmarket.module.abonnement.scheduler;

import com.sencarmarket.module.abonnement.service.AbonnementServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Tâche planifiée pour la gestion automatique des abonnements
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AbonnementScheduler {

    private final AbonnementServiceImpl abonnementService;

    /**
     * Vérifie et expire les abonnements chaque jour à minuit
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void expireSubscriptions() {
        log.info("🔄 Début de la tâche planifiée d'expiration des abonnements");
        try {
            abonnementService.expireSubscriptions();
            log.info("✅ Tâche d'expiration des abonnements terminée");
        } catch (Exception e) {
            log.error("❌ Erreur lors de l'expiration des abonnements: {}", e.getMessage(), e);
        }
    }

    /**
     * Vérifie les abonnements expirant bientôt (notification proactive)
     * S'exécute chaque jour à 9h du matin
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void notifyExpiringSubscriptions() {
        log.info("🔄 Vérification des abonnements expirant bientôt");
        try {
            int count = abonnementService.notifierExpirationsProches();
            log.info("✅ {} notifications d'expiration envoyées", count);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la notification des expirations: {}", e.getMessage(), e);
        }
    }
}

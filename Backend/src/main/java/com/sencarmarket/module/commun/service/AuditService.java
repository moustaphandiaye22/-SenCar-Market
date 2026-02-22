package com.sencarmarket.module.commun.service;

import com.sencarmarket.module.commun.entity.AuditLog;
import com.sencarmarket.module.commun.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service pour la journalisation des opérations sensibles (Audit Trail)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Journalise une action avec informations complètes
     */
    @Async
    public void logAction(UUID utilisateurId, 
                         String utilisateurEmail, 
                         String action, 
                         String typeEntite, 
                         UUID idEntite, 
                         String details,
                         String adresseIp, 
                         String userAgent,
                         String statut,
                         String messageErreur) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .utilisateurId(utilisateurId)
                    .utilisateurEmail(utilisateurEmail)
                    .action(action)
                    .typeEntite(typeEntite)
                    .idEntite(idEntite)
                    .details(details)
                    .adresseIp(adresseIp)
                    .userAgent(userAgent)
                    .statut(statut)
                    .messageErreur(messageErreur)
                    .dateAction(LocalDateTime.now())
                    .build();
            
            auditLogRepository.save(auditLog);
            log.debug("Audit log créé: {} - {} - {}", action, typeEntite, idEntite);
        } catch (Exception e) {
            log.error("Erreur lors de la création de l'audit log: {}", e.getMessage());
        }
    }

    /**
     * Journalise une action réussie
     */
    public void logSuccess(UUID utilisateurId, 
                          String utilisateurEmail, 
                          String action, 
                          String typeEntite, 
                          UUID idEntite, 
                          String details) {
        logAction(utilisateurId, utilisateurEmail, action, typeEntite, idEntite, 
                  details, null, null, "SUCCESS", null);
    }

    /**
     * Journalise une action échouée
     */
    public void logFailure(UUID utilisateurId, 
                           String utilisateurEmail, 
                           String action, 
                           String typeEntite, 
                           UUID idEntite, 
                           String details,
                           String messageErreur) {
        logAction(utilisateurId, utilisateurEmail, action, typeEntite, idEntite, 
                  details, null, null, "FAILURE", messageErreur);
    }

    /**
     * Journalise une action avec adresse IP
     */
    public void logWithIp(UUID utilisateurId, 
                          String utilisateurEmail, 
                          String action, 
                          String typeEntite, 
                          UUID idEntite, 
                          String details,
                          String adresseIp,
                          String userAgent) {
        logAction(utilisateurId, utilisateurEmail, action, typeEntite, idEntite, 
                  details, adresseIp, userAgent, "SUCCESS", null);
    }

    /**
     * Récupère les logs d'audit pour un utilisateur
     */
    public Page<AuditLog> getLogsByUtilisateur(UUID utilisateurId, Pageable pageable) {
        return auditLogRepository.findByUtilisateurIdOrderByDateActionDesc(utilisateurId, pageable);
    }

    /**
     * Récupère les logs d'audit par type d'action
     */
    public Page<AuditLog> getLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByActionOrderByDateActionDesc(action, pageable);
    }

    /**
     * Récupère les logs d'audit pour une entité spécifique
     */
    public Page<AuditLog> getLogsByEntity(String typeEntite, UUID idEntite, Pageable pageable) {
        return auditLogRepository.findByTypeEntiteAndIdEntiteOrderByDateActionDesc(typeEntite, idEntite, pageable);
    }

    /**
     * Récupère les logs d'audit dans une période
     */
    public Page<AuditLog> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findByDateRange(startDate, endDate, pageable);
    }

    /**
     * Vérifie si un utilisateur a effectué une action récemment (pour limitation de taux)
     */
    public boolean hasRecentlyPerformedAction(UUID utilisateurId, String action, int minutes) {
        LocalDateTime since = LocalDateTime.now().minusMinutes(minutes);
        long count = auditLogRepository.countRecentActions(action, since);
        return count > 0;
    }

    /**
     * Journalise une connexion utilisateur
     */
    public void logLogin(UUID utilisateurId, String email, String adresseIp, boolean success, String messageErreur) {
        String action = success ? AuditLog.Actions.LOGIN : AuditLog.Actions.LOGIN_FAILED;
        String details = success ? "Connexion réussie" : "Échec de connexion";
        logAction(utilisateurId, email, action, "UTILISATEUR", utilisateurId, 
                  details, adresseIp, null, success ? "SUCCESS" : "FAILURE", messageErreur);
    }

    /**
     * Journalise une inscription
     */
    public void logRegistration(String email, String typeUtilisateur) {
        logAction(null, email, AuditLog.Actions.REGISTER, "UTILISATEUR", null, 
                  "Inscription avec type: " + typeUtilisateur, null, null, "SUCCESS", null);
    }

    /**
     * Journalise un changement de mot de passe
     */
    public void logPasswordChange(UUID utilisateurId, String email, boolean success) {
        String action = AuditLog.Actions.PASSWORD_CHANGE;
        String details = success ? "Mot de passe modifié avec succès" : "Échec de modification du mot de passe";
        logAction(utilisateurId, email, action, "UTILISATEUR", utilisateurId, 
                  details, null, null, success ? "SUCCESS" : "FAILURE", null);
    }

    /**
     * Journalise une opération sensible sur un paiement
     */
    public void logPaiementOperation(UUID utilisateurId, String email, String operation, 
                                    UUID paiementId, boolean success, String messageErreur) {
        String action;
        switch (operation) {
            case "CREATE":
                action = AuditLog.Actions.PAIEMENT_CREATE;
                break;
            case "CONFIRM":
                action = AuditLog.Actions.PAIEMENT_CONFIRM;
                break;
            case "CANCEL":
                action = AuditLog.Actions.PAIEMENT_CANCEL;
                break;
            case "REFUND":
                action = AuditLog.Actions.PAIEMENT_REFUND;
                break;
            default:
                action = "PAIEMENT_" + operation;
        }
        
        logAction(utilisateurId, email, action, "PAIEMENT", paiementId, 
                  "Opération: " + operation, null, null, success ? "SUCCESS" : "FAILURE", messageErreur);
    }

    /**
     * Journalise une opération d'administration
     */
    public void logAdminOperation(UUID adminId, String adminEmail, String operation, 
                                  String targetType, UUID targetId, String details) {
        String action;
        switch (operation) {
            case "CREATE":
                action = "ADMIN_" + targetType.toUpperCase() + "_CREATE";
                break;
            case "UPDATE":
                action = "ADMIN_" + targetType.toUpperCase() + "_UPDATE";
                break;
            case "DELETE":
                action = "ADMIN_" + targetType.toUpperCase() + "_DELETE";
                break;
            case "ROLE_CHANGE":
                action = AuditLog.Actions.ADMIN_ROLE_CHANGE;
                break;
            default:
                action = "ADMIN_" + operation;
        }
        
        logSuccess(adminId, adminEmail, action, targetType, targetId, details);
    }
}

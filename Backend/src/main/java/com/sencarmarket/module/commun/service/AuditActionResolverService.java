package com.sencarmarket.module.commun.service;

import com.sencarmarket.module.commun.entity.AuditLog;
import org.springframework.stereotype.Service;

@Service
public class AuditActionResolverService {

    public String resolvePaiementAction(String operation) {
        if (operation == null) {
            return "PAIEMENT_UNKNOWN";
        }
        return switch (operation) {
            case "CREATE" -> AuditLog.Actions.PAIEMENT_CREATE;
            case "CONFIRM" -> AuditLog.Actions.PAIEMENT_CONFIRM;
            case "CANCEL" -> AuditLog.Actions.PAIEMENT_CANCEL;
            case "REFUND" -> AuditLog.Actions.PAIEMENT_REFUND;
            default -> "PAIEMENT_" + operation;
        };
    }

    public String resolveAdminAction(String operation, String targetType) {
        String normalizedTarget = targetType == null ? "UNKNOWN" : targetType.toUpperCase();
        if (operation == null) {
            return "ADMIN_UNKNOWN";
        }
        return switch (operation) {
            case "CREATE" -> "ADMIN_" + normalizedTarget + "_CREATE";
            case "UPDATE" -> "ADMIN_" + normalizedTarget + "_UPDATE";
            case "DELETE" -> "ADMIN_" + normalizedTarget + "_DELETE";
            case "ROLE_CHANGE" -> AuditLog.Actions.ADMIN_ROLE_CHANGE;
            default -> "ADMIN_" + operation;
        };
    }
}

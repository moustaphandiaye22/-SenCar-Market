package com.sencarmarket.module.commun.exception;

/**
 * Exception pour les statuts invalides
 */
public class InvalidStatusException extends RuntimeException {

    public InvalidStatusException(String message) {
        super(message);
    }

    public InvalidStatusException(String status, String[] validStatuses) {
        super(String.format("Statut '%s' invalide. Les statuts valides sont: %s", 
            status, String.join(", ", validStatuses)));
    }
}

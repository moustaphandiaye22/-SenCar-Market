package com.sencarmarket.module.commun.exception;

/**
 * Exception pour les accès non autorisés
 */
public class UnauthorizedAccessException extends RuntimeException {

    public UnauthorizedAccessException(String message) {
        super(message);
    }

    public UnauthorizedAccessException() {
        super("Vous n'êtes pas autorisé à effectuer cette action");
    }
}

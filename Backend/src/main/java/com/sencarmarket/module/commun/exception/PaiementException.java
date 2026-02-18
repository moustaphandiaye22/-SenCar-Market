package com.sencarmarket.module.commun.exception;

/**
 * Exception personnalisée pour les erreurs de paiement
 * Suit le pattern Custom Exception de Clean Code
 */
public class PaiementException extends RuntimeException {
    
    private final String code;
    private final String details;

    public PaiementException(String message) {
        super(message);
        this.code = "PAIEMENT_ERROR";
        this.details = null;
    }

    public PaiementException(String code, String message) {
        super(message);
        this.code = code;
        this.details = null;
    }

    public PaiementException(String code, String message, String details) {
        super(message);
        this.code = code;
        this.details = details;
    }

    public PaiementException(String message, Throwable cause) {
        super(message, cause);
        this.code = "PAIEMENT_ERROR";
        this.details = null;
    }

    public String getCode() {
        return code;
    }

    public String getDetails() {
        return details;
    }
}

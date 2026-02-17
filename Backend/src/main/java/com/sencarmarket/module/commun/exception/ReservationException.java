package com.sencarmarket.module.commun.exception;

/**
 * Exception personnalisée pour les erreurs de réservation
 */
public class ReservationException extends RuntimeException {

    public ReservationException(String message) {
        super(message);
    }

    public ReservationException(String message, Throwable cause) {
        super(message, cause);
    }
}

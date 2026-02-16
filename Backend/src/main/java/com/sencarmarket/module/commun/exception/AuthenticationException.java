package com.sencarmarket.module.commun.exception;

import lombok.Getter;

/**
 * Exception levée lors des erreurs d'authentification
 */
@Getter
public class AuthenticationException extends RuntimeException {
    
    public AuthenticationException(String message) {
        super(message);
    }
}

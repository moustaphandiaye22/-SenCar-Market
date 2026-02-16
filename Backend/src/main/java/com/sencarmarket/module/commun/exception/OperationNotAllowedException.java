package com.sencarmarket.module.commun.exception;

import lombok.Getter;

/**
 * Exception levée lorsqu'une opération n'est pas autorisée
 */
@Getter
public class OperationNotAllowedException extends RuntimeException {
    
    public OperationNotAllowedException(String message) {
        super(message);
    }
}

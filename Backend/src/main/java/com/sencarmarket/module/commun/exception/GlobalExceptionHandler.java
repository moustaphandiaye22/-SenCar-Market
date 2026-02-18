package com.sencarmarket.module.commun.exception;

import com.sencarmarket.module.commun.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Gestionnaire global des exceptions
 * Pattern: Exception Handler
 * Retourne des réponses API cohérentes
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Gestion des erreurs de validation
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ApiResponse<Object> response = ApiResponse.error(
                "VALIDATION_ERROR",
                "Erreur de validation des données",
                errors
        );
        
        log.warn("Validation error: {}", errors);
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Gestion des exceptions ResourceNotFound
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFound(
            ResourceNotFoundException ex) {
        
        ApiResponse<Object> response = ApiResponse.error(
                "RESOURCE_NOT_FOUND",
                ex.getMessage(),
                null
        );
        
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Gestion des exceptions de paiement
     */
    @ExceptionHandler(PaiementException.class)
    public ResponseEntity<ApiResponse<Object>> handlePaiementException(
            PaiementException ex) {
        
        Map<String, Object> details = new HashMap<>();
        details.put("code", ex.getCode());
        details.put("timestamp", LocalDateTime.now().toString());
        if (ex.getDetails() != null) {
            details.put("details", ex.getDetails());
        }

        ApiResponse<Object> response = ApiResponse.error(
                ex.getCode(),
                ex.getMessage(),
                details
        );
        
        log.error("Paiement error [{}]: {}", ex.getCode(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Gestion des exceptions d'opération invalide
     */
    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ApiResponse<Object>> handleInvalidOperation(
            InvalidOperationException ex) {
        
        ApiResponse<Object> response = ApiResponse.error(
                "INVALID_OPERATION",
                ex.getMessage(),
                null
        );
        
        log.warn("Invalid operation: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Gestion des erreurs générales
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
        
        ApiResponse<Object> response = ApiResponse.error(
                "INTERNAL_ERROR",
                "Une erreur interne s'est produite",
                null
        );
        
        log.error("Unexpected error: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

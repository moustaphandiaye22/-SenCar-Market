package com.sencarmarket.module.utilisateur.service.auth;

import org.springframework.security.core.userdetails.UserDetails;

import java.util.Map;

/**
 * Interface pour le service JWT
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IJwtService {

    String extractUsername(String token);

    String generateToken(UserDetails userDetails);

    String generateToken(Map<String, Object> extraClaims, UserDetails userDetails);

    String generateRefreshToken(UserDetails userDetails);

    boolean isTokenValid(String token, UserDetails userDetails);

    boolean isTokenExpired(String token);

    long getJwtExpiration();
}

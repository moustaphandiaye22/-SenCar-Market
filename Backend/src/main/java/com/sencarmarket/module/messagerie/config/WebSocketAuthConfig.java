package com.sencarmarket.module.messagerie.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import javax.crypto.SecretKey;
import java.util.Collections;
import java.util.Date;
import java.util.UUID;

/**
 * Configuration de l'authentification WebSocket avec JWT
 */
@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@Slf4j
public class WebSocketAuthConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${jwt.secret}")
    private String secretKey;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Extraire le token du header
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        
                        try {
                            // Valider le token et extraire l'ID utilisateur
                            if (isTokenValid(token)) {
                                UUID userId = extractUserId(token);
                                
                                // Créer l'authentification
                                UsernamePasswordAuthenticationToken auth = 
                                    new UsernamePasswordAuthenticationToken(
                                        userId, 
                                        null, 
                                        Collections.emptyList()
                                    );
                                
                                accessor.setUser(auth);
                                log.info("WebSocket authenticated for user: {}", userId);
                            } else {
                                log.warn("Invalid JWT token for WebSocket connection");
                                throw new IllegalArgumentException("Token JWT invalide");
                            }
                        } catch (Exception e) {
                            log.error("WebSocket authentication failed: {}", e.getMessage());
                            throw new IllegalArgumentException("Authentication failed: " + e.getMessage());
                        }
                    } else {
                        log.warn("No Authorization header in WebSocket CONNECT");
                        throw new IllegalArgumentException("Authorization header required");
                    }
                }

                return message;
            }
        });
    }

    /**
     * Valider le token JWT (signature et expiration)
     */
    private boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !isTokenExpired(claims);
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Vérifier si le token est expiré
     */
    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    /**
     * Extraire l'ID utilisateur du token
     */
    private UUID extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        String userIdStr = claims.get("userId", String.class);
        if (userIdStr == null) {
            // Fallback: utiliser le username (email)
            String username = claims.getSubject();
            // Retourner un UUID basé sur le username pour l'identification
            return UUID.nameUUIDFromBytes(username.getBytes());
        }
        return UUID.fromString(userIdStr);
    }

    /**
     * Extraire tous les claims du token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Obtenir la clé de signature
     */
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

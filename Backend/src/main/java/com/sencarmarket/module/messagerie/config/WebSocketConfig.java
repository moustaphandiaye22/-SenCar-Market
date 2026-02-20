package com.sencarmarket.module.messagerie.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuration WebSocket pour la messagerie en temps réel
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Activer le broker de messages pour les destinations-prefix
        config.enableSimpleBroker("/topic", "/queue");
        // Préfixe pour les messages destinés au serveur
        config.setApplicationDestinationPrefixes("/app");
        // Préfixe pour les messages utilisateur vers utilisateur
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Point de terminaison WebSocket avec support SockJS
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        // Point de terminaison sans SockJS (pour les clients WebSocket natifs)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }
}

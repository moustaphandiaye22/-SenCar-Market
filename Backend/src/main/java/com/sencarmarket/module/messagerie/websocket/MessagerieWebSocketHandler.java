package com.sencarmarket.module.messagerie.websocket;

import com.sencarmarket.module.messagerie.dto.MessageResponse;
import com.sencarmarket.module.messagerie.service.MessagerieService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gestionnaire des événements WebSocket pour la messagerie
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MessagerieWebSocketHandler {

    private final SimpMessagingTemplate messagingTemplate;
    
    // Stocke les sessions actives par utilisateur
    private final Map<String, String> activeSessions = new ConcurrentHashMap<>();

    /**
     * Envoyer un message à tous les participants d'une conversation
     */
    public void broadcastMessageToConversation(MessageResponse message, String conversationId) {
        log.info("Broadcasting message to conversation: {}", conversationId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, message);
    }

    /**
     * Envoyer une notification à un utilisateur spécifique
     */
    public void sendNotificationToUser(String userId, String type, Object payload) {
        log.info("Sending notification to user: {}", userId);
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                payload
        );
    }

    /**
     * Envoyer un message à un utilisateur spécifique
     */
    public void sendMessageToUser(String userId, MessageResponse message) {
        log.info("Sending message to user: {}", userId);
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/messages",
                message
        );
    }

    /**
     * Notifier les utilisateurs d'un nouveau message
     */
    public void notifierNouveauMessage(MessageResponse message, java.util.List<java.util.UUID> destinataires) {
        for (java.util.UUID destinataireId : destinataires) {
            sendMessageToUser(destinataireId.toString(), message);
        }
    }

    /**
     * Événement de connexion WebSocket
     */
    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        String sessionId = event.getMessage().getHeaders().get("simpSessionId", String.class);
        log.info("WebSocket session connected: {}", sessionId);
    }

    /**
     * Événement de déconnexion WebSocket
     */
    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        log.info("WebSocket session disconnected: {}", sessionId);
        
        // Retirer la session inactive
        activeSessions.entrySet().removeIf(entry -> entry.getValue().equals(sessionId));
    }

    /**
     * Envoyer un message de typing à la conversation
     */
    public void sendTypingIndicator(String conversationId, String userId, boolean isTyping) {
        Map<String, Object> typingEvent = Map.of(
                "type", "TYPING",
                "conversationId", conversationId,
                "userId", userId,
                "isTyping", isTyping
        );
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/typing", typingEvent);
    }
}

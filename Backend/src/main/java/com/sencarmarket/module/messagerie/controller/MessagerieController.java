package com.sencarmarket.module.messagerie.controller;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.security.AccessControlService;
import com.sencarmarket.module.commun.exception.UnauthorizedAccessException;
import com.sencarmarket.module.messagerie.dto.*;
import com.sencarmarket.module.messagerie.service.MessagerieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Contrôleur pour la gestion de la messagerie
 */
@RestController
@RequestMapping("/api/messagerie")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("isAuthenticated()")
public class MessagerieController {

    private final MessagerieService messagerieService;
    private final AccessControlService accessControlService;

    // ========== CONVERSATION ==========

    /**
     * Créer une nouvelle conversation
     */
    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> createConversation(
            @Valid @RequestBody CreateConversationRequest request,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("POST /api/messagerie/conversations - Creating conversation");
        ConversationResponse response = messagerieService.createConversation(request, utilisateurId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtenir une conversation par son ID
     */
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ConversationResponse> getConversation(
            @PathVariable UUID conversationId,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("GET /api/messagerie/conversations/{}", conversationId);
        ConversationResponse response = messagerieService.getConversationById(conversationId, utilisateurId);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtenir toutes les conversations d'un utilisateur
     */
    @GetMapping("/conversations")
    public ResponseEntity<PaginatedResponse<ConversationResponse>> getConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("GET /api/messagerie/conversations - page: {}, size: {}", page, size);
        PaginatedResponse<ConversationResponse> response = messagerieService.getConversationsByUtilisateur(
                utilisateurId, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Rechercher des conversations
     */
    @GetMapping("/conversations/search")
    public ResponseEntity<List<ConversationResponse>> searchConversations(
            @RequestParam String query,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("GET /api/messagerie/conversations/search?query={}", query);
        List<ConversationResponse> response = messagerieService.searchConversations(utilisateurId, query);
        return ResponseEntity.ok(response);
    }

    /**
     * Ajouter un participant à une conversation
     */
    @PostMapping("/conversations/{conversationId}/participants")
    public ResponseEntity<ConversationResponse> addParticipant(
            @PathVariable UUID conversationId,
            @RequestParam UUID utilisateurId,
            Authentication authentication) {
        UUID currentUserId = accessControlService.getCurrentUserId(authentication);
        checkConversationAdmin(conversationId, currentUserId);
        log.info("POST /api/messagerie/conversations/{}/participants", conversationId);
        ConversationResponse response = messagerieService.addParticipant(conversationId, utilisateurId);
        return ResponseEntity.ok(response);
    }

    /**
     * Supprimer un participant d'une conversation
     */
    @DeleteMapping("/conversations/{conversationId}/participants/{utilisateurId}")
    public ResponseEntity<Void> removeParticipant(
            @PathVariable UUID conversationId,
            @PathVariable UUID utilisateurId,
            Authentication authentication) {
        UUID currentUserId = accessControlService.getCurrentUserId(authentication);
        if (!currentUserId.equals(utilisateurId)) {
            checkConversationAdmin(conversationId, currentUserId);
        } else {
            messagerieService.getConversationById(conversationId, currentUserId);
        }
        log.info("DELETE /api/messagerie/conversations/{}/participants/{}", conversationId, utilisateurId);
        messagerieService.removeParticipant(conversationId, utilisateurId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtenir les participants d'une conversation
     */
    @GetMapping("/conversations/{conversationId}/participants")
    public ResponseEntity<List<ParticipantResponse>> getParticipants(
            @PathVariable UUID conversationId,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        messagerieService.getConversationById(conversationId, utilisateurId);
        log.info("GET /api/messagerie/conversations/{}/participants", conversationId);
        List<ParticipantResponse> response = messagerieService.getParticipants(conversationId);
        return ResponseEntity.ok(response);
    }

    // ========== MESSAGE ==========

    /**
     * Envoyer un message
     */
    @PostMapping("/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("POST /api/messagerie/messages - Conversation: {}", request.getConversationId());
        MessageResponse response = messagerieService.sendMessage(request, utilisateurId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtenir les messages d'une conversation
     */
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<PaginatedResponse<MessageResponse>> getMessages(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("GET /api/messagerie/conversations/{}/messages - page: {}, size: {}", conversationId, page, size);
        PaginatedResponse<MessageResponse> response = messagerieService.getMessagesByConversation(
                conversationId, utilisateurId, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Marquer les messages comme lus
     */
    @PutMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID conversationId,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("PUT /api/messagerie/conversations/{}/read", conversationId);
        messagerieService.markMessagesAsRead(conversationId, utilisateurId);
        return ResponseEntity.ok().build();
    }

    /**
     * Supprimer un message
     */
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable UUID messageId,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("DELETE /api/messagerie/messages/{}", messageId);
        messagerieService.deleteMessage(messageId, utilisateurId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Épingler/désépingler un message
     */
    @PutMapping("/messages/{messageId}/pin")
    public ResponseEntity<MessageResponse> pinMessage(
            @PathVariable UUID messageId,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("PUT /api/messagerie/messages/{}/pin", messageId);
        MessageResponse response = messagerieService.pinMessage(messageId, utilisateurId);
        return ResponseEntity.ok(response);
    }

    /**
     * Envoyer un indicateur de frappe
     */
    @PostMapping("/conversations/{conversationId}/typing")
    public ResponseEntity<Void> sendTypingIndicator(
            @PathVariable UUID conversationId,
            @RequestParam boolean isTyping,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("POST /api/messagerie/conversations/{}/typing?isTyping={}", conversationId, isTyping);
        messagerieService.sendTypingIndicator(conversationId, utilisateurId, isTyping);
        return ResponseEntity.ok().build();
    }

    /**
     * Rechercher dans les messages d'une conversation
     */
    @GetMapping("/conversations/{conversationId}/messages/search")
    public ResponseEntity<PaginatedResponse<MessageResponse>> searchMessages(
            @PathVariable UUID conversationId,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("GET /api/messagerie/conversations/{}/messages/search?query={}", conversationId, query);
        PaginatedResponse<MessageResponse> response = messagerieService.searchMessages(
                conversationId, utilisateurId, query, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Mettre à jour une conversation (titre)
     */
    @PutMapping("/conversations/{conversationId}")
    public ResponseEntity<ConversationResponse> updateConversation(
            @PathVariable UUID conversationId,
            @RequestParam(required = false) String titre,
            @RequestParam(required = false) String avatarUrl,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("PUT /api/messagerie/conversations/{}", conversationId);
        ConversationResponse response = messagerieService.updateConversation(conversationId, utilisateurId, titre, avatarUrl);
        return ResponseEntity.ok(response);
    }

    /**
     * Quitter une conversation de groupe
     */
    @PostMapping("/conversations/{conversationId}/leave")
    public ResponseEntity<Void> leaveConversation(
            @PathVariable UUID conversationId,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        log.info("POST /api/messagerie/conversations/{}/leave", conversationId);
        messagerieService.leaveConversation(conversationId, utilisateurId);
        return ResponseEntity.noContent().build();
    }

    private void checkConversationAdmin(UUID conversationId, UUID utilisateurId) {
        messagerieService.getConversationById(conversationId, utilisateurId);
        List<ParticipantResponse> participants = messagerieService.getParticipants(conversationId);
        boolean isAdmin = participants.stream()
                .anyMatch(p -> utilisateurId.equals(p.getUtilisateurId()) && Boolean.TRUE.equals(p.getEstAdmin()));
        if (!isAdmin) {
            throw new UnauthorizedAccessException(AppMessages.MESSAGERIE_ONLY_CONVERSATION_ADMIN_CAN_MODIFY);
        }
    }
}

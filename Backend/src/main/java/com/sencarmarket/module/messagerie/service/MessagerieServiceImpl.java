package com.sencarmarket.module.messagerie.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.commun.service.PaginationService;
import com.sencarmarket.module.messagerie.dto.*;
import com.sencarmarket.module.messagerie.entity.Conversation;
import com.sencarmarket.module.messagerie.entity.ConversationParticipant;
import com.sencarmarket.module.messagerie.entity.Message;
import com.sencarmarket.module.messagerie.repository.ConversationParticipantRepository;
import com.sencarmarket.module.messagerie.repository.ConversationRepository;
import com.sencarmarket.module.messagerie.repository.MessageRepository;
import com.sencarmarket.module.messagerie.websocket.MessagerieWebSocketHandler;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implémentation du service messagerie
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MessagerieServiceImpl implements MessagerieService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ConversationParticipantRepository participantRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final MessagerieWebSocketHandler webSocketHandler;
    private final MessagerieAccessService messagerieAccessService;
    private final MessagerieConversationAssembler messagerieConversationAssembler;
    private final PaginationService paginationService;

    // ========== CONVERSATION ==========

    @Override
    @Transactional
    public ConversationResponse createConversation(CreateConversationRequest request, UUID createurId) {
        log.info("Creating conversation '{}' by user {}", request.getTitre(), createurId);

        Utilisateur createur = utilisateurRepository.findById(createurId)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.USER_NOT_FOUND));

        Conversation.TypeConversation type = Conversation.TypeConversation.valueOf(
                request.getTypeConversation() != null ? request.getTypeConversation() : "DIRECT");

        // Pour les conversations directes
        if (type == Conversation.TypeConversation.DIRECT && request.getAutreUtilisateurId() != null) {
            conversationRepository.findDirectConversation(createurId, request.getAutreUtilisateurId())
                    .ifPresent(existing -> {
                        throw new InvalidOperationException(AppMessages.MESSAGERIE_DIRECT_CONVERSATION_EXISTS);
                    });
        }

        Conversation conversation = Conversation.builder()
                .titre(request.getTitre())
                .typeConversation(type)
                .annonceId(request.getAnnonceId())
                .build();

        conversation = conversationRepository.save(conversation);

        // Ajouter le créateur comme participant
        ConversationParticipant participant = ConversationParticipant.builder()
                .conversation(conversation)
                .utilisateur(createur)
                .estAdmin(true)
                .estMute(false)
                .nombreNonLus(0)
                .build();
        participantRepository.save(participant);

        log.info("Conversation created with ID: {}", conversation.getId());
        return messagerieConversationAssembler.assemble(conversation, createurId);
    }

    @Override
    public ConversationResponse getConversationById(UUID conversationId, UUID utilisateurId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.CONVERSATION_NOT_FOUND));
        messagerieAccessService.ensureParticipant(conversationId, utilisateurId);

        return messagerieConversationAssembler.assemble(conversation, utilisateurId);
    }

    @Override
    public PaginatedResponse<ConversationResponse> getConversationsByUtilisateur(UUID utilisateurId, int page, int size) {
        Page<Conversation> conversationPage = conversationRepository.findByParticipantId(
                utilisateurId, PageRequest.of(page, size));

        List<ConversationResponse> content = conversationPage.getContent().stream()
                .map(c -> messagerieConversationAssembler.assemble(c, utilisateurId))
                .collect(Collectors.toList());

        return paginationService.build(conversationPage, content);
    }

    @Override
    public List<ConversationResponse> searchConversations(UUID utilisateurId, String query) {
        return conversationRepository.search(utilisateurId, query).stream()
                .map(c -> messagerieConversationAssembler.assemble(c, utilisateurId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ConversationResponse addParticipant(UUID conversationId, UUID utilisateurId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.CONVERSATION_NOT_FOUND));

        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.USER_NOT_FOUND));

        if (participantRepository.existsByConversationIdAndUtilisateurId(conversationId, utilisateurId)) {
            throw new InvalidOperationException(AppMessages.MESSAGERIE_PARTICIPANT_ALREADY_EXISTS);
        }

        ConversationParticipant participant = ConversationParticipant.builder()
                .conversation(conversation)
                .utilisateur(utilisateur)
                .estAdmin(false)
                .estMute(false)
                .nombreNonLus(0)
                .build();

        participantRepository.save(participant);
        return messagerieConversationAssembler.assemble(conversation, utilisateurId);
    }

    @Override
    @Transactional
    public void removeParticipant(UUID conversationId, UUID utilisateurId) {
        ConversationParticipant participant = participantRepository
                .findByConversationIdAndUtilisateurId(conversationId, utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.PARTICIPANT_NOT_FOUND));

        participantRepository.delete(participant);
        log.info("User {} removed from conversation {}", utilisateurId, conversationId);
    }

    @Override
    public List<ParticipantResponse> getParticipants(UUID conversationId) {
        return participantRepository.findByConversationId(conversationId).stream()
                .map(ParticipantResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ========== MESSAGE ==========

    @Override
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, UUID expediteurId) {
        log.info("Sending message to conversation {} by user {}", request.getConversationId(), expediteurId);

        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.CONVERSATION_NOT_FOUND));

        Utilisateur utilisateur = utilisateurRepository.findById(expediteurId)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.USER_NOT_FOUND));

        messagerieAccessService.ensureParticipant(request.getConversationId(), expediteurId);

        Message message = Message.builder()
                .conversation(conversation)
                .utilisateur(utilisateur)
                .contenu(request.getContenu())
                .typeMessage(request.getTypeMessage() != null ? request.getTypeMessage() : "TEXTE")
                .estLu(false)
                .estSupprime(false)
                .estEpingle(false)
                .build();

        message = messageRepository.save(message);

        // Mettre à jour la date de la conversation
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Notifier les autres participants
        List<UUID> destinataires = participantRepository.findByConversationId(conversation.getId()).stream()
                .filter(p -> !p.getUtilisateur().getId().equals(expediteurId))
                .map(p -> p.getUtilisateur().getId())
                .collect(Collectors.toList());

        MessageResponse messageResponse = MessageResponse.fromEntity(message);
        notifierNouveauMessage(messageResponse, destinataires);

        log.info("Message sent with ID: {}", message.getId());
        return messageResponse;
    }

    @Override
    public PaginatedResponse<MessageResponse> getMessagesByConversation(UUID conversationId, UUID utilisateurId, int page, int size) {
        messagerieAccessService.ensureParticipant(conversationId, utilisateurId);

        Page<Message> messagePage = messageRepository.findByConversationIdOrderByDateEnvoiDesc(
                conversationId, PageRequest.of(page, size));

        List<MessageResponse> content = messagePage.getContent().stream()
                .map(MessageResponse::fromEntity)
                .collect(Collectors.toList());

        return paginationService.build(messagePage, content);
    }

    @Override
    @Transactional
    public void markMessagesAsRead(UUID conversationId, UUID utilisateurId) {
        messageRepository.markAllAsRead(conversationId, utilisateurId);
        log.info("Messages marked as read in conversation {} for user {}", conversationId, utilisateurId);
    }

    @Override
    @Transactional
    public void deleteMessage(UUID messageId, UUID utilisateurId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.MESSAGE_NOT_FOUND));

        messagerieAccessService.ensureMessageOwner(message, utilisateurId);

        message.setEstSupprime(true);
        messageRepository.save(message);
        log.info("Message {} deleted by user {}", messageId, utilisateurId);
    }

    @Override
    @Transactional
    public MessageResponse pinMessage(UUID messageId, UUID utilisateurId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.MESSAGE_NOT_FOUND));

        messagerieAccessService.ensureAdmin(message.getConversation().getId(), utilisateurId);

        message.setEstEpingle(!message.getEstEpingle());
        message = messageRepository.save(message);

        return MessageResponse.fromEntity(message);
    }

    @Override
    public void notifierNouveauMessage(MessageResponse message, List<UUID> destinatairesId) {
        // Envoyer via WebSocket pour notification en temps réel
        if (webSocketHandler != null) {
            webSocketHandler.notifierNouveauMessage(message, destinatairesId);
            // Broadcast à la conversation
            webSocketHandler.broadcastMessageToConversation(message, message.getConversationId().toString());
        }
        log.info("Notifying {} users of new message in conversation {}", 
                destinatairesId.size(), message.getConversationId());
    }

    @Override
    public void sendTypingIndicator(UUID conversationId, UUID utilisateurId, boolean isTyping) {
        messagerieAccessService.ensureParticipant(conversationId, utilisateurId);

        // Envoyer via WebSocket
        if (webSocketHandler != null) {
            webSocketHandler.sendTypingIndicator(conversationId.toString(), utilisateurId.toString(), isTyping);
        }
        log.info("Typing indicator sent: conversation={}, user={}, isTyping={}", conversationId, utilisateurId, isTyping);
    }

    @Override
    public PaginatedResponse<MessageResponse> searchMessages(UUID conversationId, UUID utilisateurId, String query, int page, int size) {
        messagerieAccessService.ensureParticipant(conversationId, utilisateurId);

        Page<Message> messagePage = messageRepository.searchMessages(
                conversationId, query, PageRequest.of(page, size));

        List<MessageResponse> content = messagePage.getContent().stream()
                .map(MessageResponse::fromEntity)
                .collect(Collectors.toList());

        return paginationService.build(messagePage, content);
    }

    // ========== METHODES PRIVEES ==========

    @Override
    @Transactional
    public ConversationResponse updateConversation(UUID conversationId, UUID utilisateurId, String titre, String avatarUrl) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.CONVERSATION_NOT_FOUND));

        messagerieAccessService.ensureAdmin(conversationId, utilisateurId);

        if (titre != null) {
            conversation.setTitre(titre);
        }
        if (avatarUrl != null) {
            conversation.setAvatarUrl(avatarUrl);
        }

        conversation = conversationRepository.save(conversation);
        log.info("Conversation {} updated by user {}", conversationId, utilisateurId);

        return messagerieConversationAssembler.assemble(conversation, utilisateurId);
    }

    @Override
    @Transactional
    public void leaveConversation(UUID conversationId, UUID utilisateurId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException(AppMessages.CONVERSATION_NOT_FOUND));

        ConversationParticipant participant = messagerieAccessService.getParticipantOrThrow(conversationId, utilisateurId);
        messagerieAccessService.ensureCanLeaveConversation(conversation, participant);

        participantRepository.delete(participant);
        log.info("User {} left conversation {}", utilisateurId, conversationId);
    }
}

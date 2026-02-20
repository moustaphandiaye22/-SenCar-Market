package com.sencarmarket.module.notification.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.notification.dto.CreateSignalementRequest;
import com.sencarmarket.module.notification.dto.SignalementResponse;
import com.sencarmarket.module.notification.entity.Signalement;
import com.sencarmarket.module.notification.enums.StatutTraitementSignalement;
import com.sencarmarket.module.notification.enums.TypeEntiteSignalable;
import com.sencarmarket.module.notification.repository.SignalementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implémentation du service de modération (Module 11 - Signalements)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SignalementServiceImpl implements ISignalementService {

    private final SignalementRepository signalementRepository;

    @Override
    @Transactional
    public Signalement createSignalement(CreateSignalementRequest request) {
        log.info("Création d'un nouveau signalement - Type: {}, Entité: {}", 
                request.getMotif(), request.getTypeEntite());

        Signalement signalement = Signalement.builder()
                .utilisateurId(request.getUtilisateurId())
                .typeEntite(request.getTypeEntite())
                .entiteId(request.getEntiteId())
                .motif(request.getMotif())
                .description(request.getDescription())
                .statutTraitement(StatutTraitementSignalement.EN_ATTENTE)
                .dateSignalement(LocalDateTime.now())
                .build();

        Signalement saved = signalementRepository.save(signalement);
        log.info("Signalement créé avec ID: {}", saved.getId());
        
        return saved;
    }

    @Override
    public Signalement getSignalementById(UUID id) {
        return signalementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Signalement non trouvé: " + id));
    }

    @Override
    public PaginatedResponse<SignalementResponse> getAllSignalements(Pageable pageable) {
        Page<Signalement> signalementsPage = signalementRepository.findAll(pageable);
        return buildPaginatedResponse(signalementsPage);
    }

    @Override
    public PaginatedResponse<SignalementResponse> getSignalementsByStatut(StatutTraitementSignalement statut, Pageable pageable) {
        Page<Signalement> signalementsPage = signalementRepository.findByStatutTraitement(statut, pageable);
        return buildPaginatedResponse(signalementsPage);
    }

    @Override
    public PaginatedResponse<SignalementResponse> getSignalementsByTypeEntite(TypeEntiteSignalable typeEntite, Pageable pageable) {
        Page<Signalement> signalementsPage = signalementRepository.findByTypeEntite(typeEntite, pageable);
        return buildPaginatedResponse(signalementsPage);
    }

    @Override
    public PaginatedResponse<SignalementResponse> getPendingSignalements(Pageable pageable) {
        Page<Signalement> signalementsPage = signalementRepository.findPendingSignalements(
                StatutTraitementSignalement.EN_ATTENTE, pageable);
        return buildPaginatedResponse(signalementsPage);
    }

    @Override
    @Transactional
    public Signalement traiterSignalement(UUID id, String actionAdmin, UUID adminId) {
        log.info("Traitement du signalement {} - Action: {}, Admin: {}", id, actionAdmin, adminId);

        Signalement signalement = getSignalementById(id);

        // Vérifier que le signalement peut être traité
        if (signalement.getStatutTraitement() == StatutTraitementSignalement.TRAITE ||
            signalement.getStatutTraitement() == StatutTraitementSignalement.RESOLU) {
            throw new IllegalStateException("Ce signalement a déjà été traité");
        }

        // Déterminer le nouveau statut
        StatutTraitementSignalement nouveauStatut;
        if (actionAdmin.toUpperCase().contains("REJET")) {
            nouveauStatut = StatutTraitementSignalement.REJETE;
        } else if (actionAdmin.toUpperCase().contains("RESOLU")) {
            nouveauStatut = StatutTraitementSignalement.RESOLU;
        } else {
            nouveauStatut = StatutTraitementSignalement.TRAITE;
        }

        signalement.setStatutTraitement(nouveauStatut);
        signalement.setActionAdmin(actionAdmin);
        signalement.setAdminId(adminId);
        signalement.setDateTraitement(LocalDateTime.now());

        Signalement saved = signalementRepository.save(signalement);
        log.info("Signalement {} traité avec succès. Nouveau statut: {}", id, nouveauStatut);

        return saved;
    }

    @Override
    public List<Signalement> getSignalementsByUtilisateur(UUID utilisateurId) {
        return signalementRepository.findByUtilisateurId(utilisateurId);
    }

    @Override
    public long countPendingSignalements() {
        return signalementRepository.countByStatut(StatutTraitementSignalement.EN_ATTENTE);
    }

    // ==================== HELPERS ====================

    /**
     * Méthode helper pour construire la réponse paginée
     */
    private PaginatedResponse<SignalementResponse> buildPaginatedResponse(Page<Signalement> signalementsPage) {
        List<SignalementResponse> content = signalementsPage.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<SignalementResponse>builder()
                .content(content)
                .page(signalementsPage.getNumber())
                .size(signalementsPage.getSize())
                .totalElements(signalementsPage.getTotalElements())
                .totalPages(signalementsPage.getTotalPages())
                .last(signalementsPage.isLast())
                .first(signalementsPage.isFirst())
                .build();
    }

    private SignalementResponse toResponse(Signalement signalement) {
        return SignalementResponse.builder()
                .id(signalement.getId())
                .utilisateurId(signalement.getUtilisateurId())
                .typeEntite(signalement.getTypeEntite())
                .entiteId(signalement.getEntiteId())
                .motif(signalement.getMotif())
                .description(signalement.getDescription())
                .statutTraitement(signalement.getStatutTraitement())
                .actionAdmin(signalement.getActionAdmin())
                .adminId(signalement.getAdminId())
                .dateTraitement(signalement.getDateTraitement())
                .dateSignalement(signalement.getDateSignalement())
                .build();
    }
}

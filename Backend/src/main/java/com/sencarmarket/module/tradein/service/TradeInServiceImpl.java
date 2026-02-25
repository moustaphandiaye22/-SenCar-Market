package com.sencarmarket.module.tradein.service;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.tradein.dto.*;
import com.sencarmarket.module.tradein.entity.DemandeTradeIn;
import com.sencarmarket.module.tradein.entity.DemandeTradeIn.StatutTradeIn;
import com.sencarmarket.module.tradein.repository.DemandeTradeInRepository;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import com.sencarmarket.module.vehicule.repository.VehiculeRepository;
import com.sencarmarket.module.notification.service.INotificationService;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class TradeInServiceImpl implements TradeInService {
    private static final String RESOURCE_UTILISATEUR = "Utilisateur";
    private static final String RESOURCE_VEHICULE = "Véhicule";
    private static final String RESOURCE_DEMANDE_TRADE_IN = "DemandeTradeIn";
    private static final String FIELD_ID = "id";


    private final DemandeTradeInRepository demandeTradeInRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final VehiculeRepository vehiculeRepository;
    private final INotificationService notificationService;
    private final TradeInEstimationService tradeInEstimationService;
    private final TradeInStatusTransitionService tradeInStatusTransitionService;

    @Override
    @Transactional
    public DemandeTradeInResponse createDemande(CreateDemandeTradeInRequest request, UUID utilisateurId) {
        log.info("Creating trade-in request for user {} and vehicle {}", utilisateurId, request.getVehiculeActuelId());

        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_UTILISATEUR, FIELD_ID, utilisateurId));

        Vehicule vehiculeActuel = vehiculeRepository.findById(request.getVehiculeActuelId())
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_VEHICULE, FIELD_ID, request.getVehiculeActuelId()));

        Vehicule vehiculeSouhaite = null;
        if (request.getVehiculeSouhaiteId() != null) {
            vehiculeSouhaite = vehiculeRepository.findById(request.getVehiculeSouhaiteId())
                    .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_VEHICULE, FIELD_ID, request.getVehiculeSouhaiteId()));
        }

        DemandeTradeIn demande = DemandeTradeIn.builder()
                .utilisateur(utilisateur)
                .vehiculeActuel(vehiculeActuel)
                .vehiculeSouhaite(vehiculeSouhaite)
                .statut(StatutTradeIn.EN_ATTENTE)
                .kilometrageActuel(request.getKilometrageActuel())
                .etatVehicule(request.getEtatVehicule())
                .build();

        demande = demandeTradeInRepository.save(demande);
        log.info("Trade-in request created with ID: {}", demande.getId());

        // Envoyer une notification de confirmation
        notificationService.notifierTradeIn(
                utilisateurId,
                "Trade-In",
                "EN_ATTENTE - Votre demande est en attente d'évaluation"
        );

        return mapToResponse(demande);
    }

    @Override
    public DemandeTradeInResponse getDemandeById(UUID id) {
        log.debug("Fetching trade-in request by ID: {}", id);
        DemandeTradeIn demande = demandeTradeInRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_TRADE_IN, FIELD_ID, id));
        return mapToResponse(demande);
    }

    @Override
    public PaginatedResponse<DemandeTradeInResponse> getAllDemandes(int page, int size) {
        log.debug("Fetching all trade-in requests - page: {}, size: {}", page, size);
        
        Page<DemandeTradeIn> demandePage = demandeTradeInRepository.findAll(PageRequest.of(page, size));
        
        List<DemandeTradeInResponse> content = demandePage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return buildPaginatedResponse(demandePage, content);
    }

    @Override
    public List<DemandeTradeInResponse> getDemandesByUtilisateur(UUID utilisateurId) {
        log.debug("Fetching trade-in requests for user: {}", utilisateurId);
        return demandeTradeInRepository.findByUtilisateurId(utilisateurId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DemandeTradeInResponse updateDemande(UUID id, CreateDemandeTradeInRequest request) {
        log.info("Updating trade-in request {}", id);
        
        DemandeTradeIn demande = demandeTradeInRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_TRADE_IN, FIELD_ID, id));

        if (demande.getStatut() != StatutTradeIn.EN_ATTENTE) {
            throw new InvalidOperationException(AppMessages.TRADEIN_ONLY_PENDING_UPDATE);
        }

        demande.setKilometrageActuel(request.getKilometrageActuel());
        demande.setEtatVehicule(request.getEtatVehicule());

        demande = demandeTradeInRepository.save(demande);
        log.info("Trade-in request {} updated", id);
        
        return mapToResponse(demande);
    }

    @Override
    @Transactional
    public void deleteDemande(UUID id) {
        log.info("Deleting trade-in request {}", id);
        
        DemandeTradeIn demande = demandeTradeInRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_TRADE_IN, FIELD_ID, id));

        if (demande.getStatut() == StatutTradeIn.ACCEPTE) {
            throw new InvalidOperationException(AppMessages.TRADEIN_CANNOT_DELETE_ACCEPTED);
        }

        demandeTradeInRepository.delete(demande);
        log.info("Trade-in request {} deleted", id);
    }

    @Override
    public EstimationResponse estimerVehicule(EstimationRequest request) {
        log.info("Estimating vehicle {} with {} km, etat: {}", 
                request.getVehiculeId(), request.getKilometrage(), request.getEtatVehicule());

        Vehicule vehicule = vehiculeRepository.findById(request.getVehiculeId())
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_VEHICULE, FIELD_ID, request.getVehiculeId()));
        EstimationResponse estimation = tradeInEstimationService.calculate(
                vehicule,
                request.getKilometrage(),
                request.getEtatVehicule()
        );
        log.info("Estimation: {} XOF (min: {}, max: {})",
                estimation.getPrixEstime(), estimation.getPrixMinimum(), estimation.getPrixMaximum());
        return estimation;
    }

    @Override
    @Transactional
    public DemandeTradeInResponse calculerEstimationAuto(UUID demandeId) {
        log.info("Calculating auto estimation for trade-in request {}", demandeId);

        DemandeTradeIn demande = demandeTradeInRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_TRADE_IN, FIELD_ID, demandeId));

        // Créer une requête d'estimation
        EstimationRequest request = EstimationRequest.builder()
                .vehiculeId(demande.getVehiculeActuel().getId())
                .kilometrage(demande.getKilometrageActuel())
                .etatVehicule(demande.getEtatVehicule())
                .build();

        // Calculer l'estimation
        EstimationResponse estimation = estimerVehicule(request);

        // Mettre à jour la demande
        demande.setPrixEstime(estimation.getPrixEstime());
        demande.setStatut(StatutTradeIn.EVALUATION_TERMINEE);
        demande.setDateEvaluation(LocalDateTime.now());

        demande = demandeTradeInRepository.save(demande);
        log.info("Estimation calculated: {} XOF for request {}", estimation.getPrixEstime(), demandeId);

        // Sauvegarder dans l'historique
        tradeInEstimationService.saveHistory(estimation, demande.getVehiculeActuel());

        // Notifier l'utilisateur
        notificationService.notifierTradeIn(
                demande.getUtilisateur().getId(),
                "Estimation",
                "EVALUATION_TERMINEE - Votre estimation est prête: " + estimation.getPrixEstime() + " XOF"
        );

        return mapToResponse(demande);
    }

    @Override
    @Transactional
    public DemandeTradeInResponse validerDemande(UUID id, ValidationRequest request) {
        log.info("Validating trade-in request {} with status {}", id, request.getNouveauStatut());

        DemandeTradeIn demande = demandeTradeInRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_TRADE_IN, FIELD_ID, id));

        // Valider la transition de statut
        tradeInStatusTransitionService.validateTransition(demande.getStatut(), request.getNouveauStatut());

        demande.setStatut(request.getNouveauStatut());
        demande.setDateTraitement(LocalDateTime.now());

        if (request.getPrixPropose() != null) {
            demande.setPrixPropose(request.getPrixPropose());
        }

        if (request.getCommentaireAdmin() != null) {
            demande.setCommentaireAdmin(request.getCommentaireAdmin());
        }

        if (request.getMotifRejet() != null) {
            demande.setMotifRejet(request.getMotifRejet());
        }

        demande = demandeTradeInRepository.save(demande);
        log.info("Trade-in request {} validated with status {}", id, request.getNouveauStatut());

        // Notifier l'utilisateur
        String message = String.format("%s - %s", 
                request.getNouveauStatut(),
                request.getCommentaireAdmin() != null ? request.getCommentaireAdmin() : "");
        notificationService.notifierTradeIn(
                demande.getUtilisateur().getId(),
                "Validation",
                message
        );

        return mapToResponse(demande);
    }

    @Override
    @Transactional
    public DemandeTradeInResponse updateStatut(UUID id, StatutTradeIn nouveauStatut) {
        log.info("Updating status of trade-in request {} to {}", id, nouveauStatut);

        DemandeTradeIn demande = demandeTradeInRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_TRADE_IN, FIELD_ID, id));

        tradeInStatusTransitionService.validateTransition(demande.getStatut(), nouveauStatut);

        demande.setStatut(nouveauStatut);
        demande.setDateTraitement(LocalDateTime.now());

        demande = demandeTradeInRepository.save(demande);
        log.info("Status updated for request {}", id);

        return mapToResponse(demande);
    }

    @Override
    @Transactional
    public DemandeTradeInResponse notifierUtilisateur(UUID id) {
        log.info("Notifying user for trade-in request {}", id);

        DemandeTradeIn demande = demandeTradeInRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_DEMANDE_TRADE_IN, FIELD_ID, id));

        // Envoyer la notification
        notificationService.notifierTradeIn(
                demande.getUtilisateur().getId(),
                "Notification",
                demande.getStatut().toString()
        );
        
        demande.setEstNotifie(true);
        demande = demandeTradeInRepository.save(demande);
        log.info("User notified for request {}", id);

        return mapToResponse(demande);
    }

    @Override
    public List<DemandeTradeInResponse> getDemandesNonNotifiees() {
        log.debug("Fetching non-notified trade-in requests");
        return demandeTradeInRepository.findByEstNotifie(false).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Méthode utilitaire pour le mapping
    private DemandeTradeInResponse mapToResponse(DemandeTradeIn demande) {
        return DemandeTradeInResponse.builder()
                .id(demande.getId())
                .utilisateurId(demande.getUtilisateur() != null ? demande.getUtilisateur().getId() : null)
                .utilisateurNom(demande.getUtilisateur() != null ? demande.getUtilisateur().getNom() : null)
                .vehiculeActuelId(demande.getVehiculeActuel() != null ? demande.getVehiculeActuel().getId() : null)
                .vehiculeActuelDescription(demande.getVehiculeActuel() != null ? 
                        demande.getVehiculeActuel().getMarque() + " " + demande.getVehiculeActuel().getModele() : null)
                .vehiculeSouhaiteId(demande.getVehiculeSouhaite() != null ? demande.getVehiculeSouhaite().getId() : null)
                .vehiculeSouhaiteDescription(demande.getVehiculeSouhaite() != null ? 
                        demande.getVehiculeSouhaite().getMarque() + " " + demande.getVehiculeSouhaite().getModele() : null)
                .statut(demande.getStatut())
                .prixEstime(demande.getPrixEstime())
                .prixPropose(demande.getPrixPropose())
                .kilometrageActuel(demande.getKilometrageActuel())
                .etatVehicule(demande.getEtatVehicule())
                .dateSoumission(demande.getDateSoumission())
                .dateTraitement(demande.getDateTraitement())
                .dateEvaluation(demande.getDateEvaluation())
                .motifRejet(demande.getMotifRejet())
                .commentaireAdmin(demande.getCommentaireAdmin())
                .estNotifie(demande.getEstNotifie())
                .createdAt(demande.getCreatedAt())
                .updatedAt(demande.getUpdatedAt())
                .build();
    }

    /**
     * Méthode helper pour construire une réponse paginée
     */
    private <T> PaginatedResponse<T> buildPaginatedResponse(Page<?> page, List<T> content) {
        return PaginatedResponse.<T>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
}

package com.sencarmarket.module.tradein.service;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.tradein.dto.*;
import com.sencarmarket.module.tradein.entity.DemandeTradeIn;
import com.sencarmarket.module.tradein.entity.DemandeTradeIn.StatutTradeIn;
import com.sencarmarket.module.tradein.entity.HistoriqueEstimation;
import com.sencarmarket.module.tradein.repository.DemandeTradeInRepository;
import com.sencarmarket.module.tradein.repository.HistoriqueEstimationRepository;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import com.sencarmarket.module.vehicule.repository.VehiculeRepository;
import com.sencarmarket.module.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradeInServiceImpl implements TradeInService {

    private final DemandeTradeInRepository demandeTradeInRepository;
    private final HistoriqueEstimationRepository historiqueEstimationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final VehiculeRepository vehiculeRepository;
    private final NotificationService notificationService;

    // Coefficients pour l'algorithme d'estimation
    private static final double COEFF_ETAT_EXCELLENT = 1.0;
    private static final double COEFF_ETAT_BON = 0.85;
    private static final double COEFF_ETAT_MOYEN = 0.70;
    private static final double COEFF_ETAT_MAUVAIS = 0.50;
    private static final double DEPRECIATION_PAR_KM = 0.0001; // 0.01% par km
    private static final double DEPRECIATION_PAR_AN = 0.10; // 10% par an
    private static final int AGE_REFERENCE = 10; // Ans de référence pour la dépréciation maximale

    @Override
    @Transactional
    public DemandeTradeInResponse createDemande(CreateDemandeTradeInRequest request, UUID utilisateurId) {
        log.info("Creating trade-in request for user {} and vehicle {}", utilisateurId, request.getVehiculeActuelId());

        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'ID: " + utilisateurId));

        Vehicule vehiculeActuel = vehiculeRepository.findById(request.getVehiculeActuelId())
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule non trouvé avec l'ID: " + request.getVehiculeActuelId()));

        Vehicule vehiculeSouhaite = null;
        if (request.getVehiculeSouhaiteId() != null) {
            vehiculeSouhaite = vehiculeRepository.findById(request.getVehiculeSouhaiteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Véhicule souhaité non trouvé"));
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
                .orElseThrow(() -> new ResourceNotFoundException("Demande trade-in non trouvée"));
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
                .orElseThrow(() -> new ResourceNotFoundException("Demande trade-in non trouvée"));

        if (demande.getStatut() != StatutTradeIn.EN_ATTENTE) {
            throw new InvalidOperationException("Seules les demandes en attente peuvent être modifiées");
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
                .orElseThrow(() -> new ResourceNotFoundException("Demande trade-in non trouvée"));

        if (demande.getStatut() == StatutTradeIn.ACCEPTE) {
            throw new InvalidOperationException("Impossible de supprimer une demande acceptée");
        }

        demandeTradeInRepository.delete(demande);
        log.info("Trade-in request {} deleted", id);
    }

    @Override
    public EstimationResponse estimerVehicule(EstimationRequest request) {
        log.info("Estimating vehicle {} with {} km, etat: {}", 
                request.getVehiculeId(), request.getKilometrage(), request.getEtatVehicule());

        Vehicule vehicule = vehiculeRepository.findById(request.getVehiculeId())
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule non trouvé"));

        // Calcul du prix estimé basé sur l'algorithme
        BigDecimal prixBase = vehicule.getPrixVente();
        if (prixBase == null) {
            prixBase = BigDecimal.ZERO;
        }

        // Coefficient d'état du véhicule
        double coeffEtat = getCoefficientEtat(request.getEtatVehicule());

        // Dépréciation basée sur le kilométrage
        double depreciationKm = request.getKilometrage() * DEPRECIATION_PAR_KM;

        // Dépréciation basée sur l'âge (si l'année est disponible)
        int anneeActuelle = LocalDateTime.now().getYear();
        int ageVehicule = anneeActuelle - vehicule.getAnneeFabrication();
        double depreciationAge = Math.min(ageVehicule * DEPRECIATION_PAR_AN, 0.7); // Max 70% de dépréciation

        // Calcul final
        double coeffTotal = coeffEtat * (1 - depreciationKm) * (1 - depreciationAge);
        BigDecimal prixEstime = prixBase.multiply(BigDecimal.valueOf(coeffTotal))
                .setScale(2, RoundingMode.HALF_UP);

        // Prix minimum et maximum (marge de ±15%)
        BigDecimal prixMinimum = prixEstime.multiply(BigDecimal.valueOf(0.85))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal prixMaximum = prixEstime.multiply(BigDecimal.valueOf(1.15))
                .setScale(2, RoundingMode.HALF_UP);

        // Score de condition (0-100)
        double scoreCondition = coeffTotal * 100;

        // Recommandation
        String recommandation = getRecommandation(scoreCondition);

        log.info("Estimation: {} XOF (min: {}, max: {})", prixEstime, prixMinimum, prixMaximum);

        return EstimationResponse.builder()
                .vehiculeId(vehicule.getId())
                .vehiculeDescription(vehicule.getMarque() + " " + vehicule.getModele())
                .prixEstime(prixEstime)
                .prixMinimum(prixMinimum)
                .prixMaximum(prixMaximum)
                .kilometrage(request.getKilometrage())
                .etatVehicule(request.getEtatVehicule())
                .scoreCondition(scoreCondition)
                .recommandation(recommandation)
                .build();
    }

    @Override
    @Transactional
    public DemandeTradeInResponse calculerEstimationAuto(UUID demandeId) {
        log.info("Calculating auto estimation for trade-in request {}", demandeId);

        DemandeTradeIn demande = demandeTradeInRepository.findById(demandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande trade-in non trouvée"));

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
        sauvegarderHistorique(estimation, demande.getVehiculeActuel());

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
                .orElseThrow(() -> new ResourceNotFoundException("Demande trade-in non trouvée"));

        // Valider la transition de statut
        validateStatutTransition(demande.getStatut(), request.getNouveauStatut());

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
                .orElseThrow(() -> new ResourceNotFoundException("Demande trade-in non trouvée"));

        validateStatutTransition(demande.getStatut(), nouveauStatut);

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
                .orElseThrow(() -> new ResourceNotFoundException("Demande trade-in non trouvée"));

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

    private double getCoefficientEtat(String etat) {
        if (etat == null) return COEFF_ETAT_MOYEN;
        
        return switch (etat.toLowerCase()) {
            case "excellent" -> COEFF_ETAT_EXCELLENT;
            case "bon" -> COEFF_ETAT_BON;
            case "moyen" -> COEFF_ETAT_MOYEN;
            case "mauvais" -> COEFF_ETAT_MAUVAIS;
            default -> COEFF_ETAT_MOYEN;
        };
    }

    private String getRecommandation(double scoreCondition) {
        if (scoreCondition >= 80) {
            return "Excellent état - Véhicule hautement souhaitable";
        } else if (scoreCondition >= 60) {
            return "Bon état - Véhicule intéressante";
        } else if (scoreCondition >= 40) {
            return "État moyen - Négociation possible";
        } else {
            return "État préoccupant - Révision nécessaire";
        }
    }

    /**
     * Sauvegarde l'estimation dans l'historique
     */
    private void sauvegarderHistorique(EstimationResponse estimation, Vehicule vehicule) {
        String marqueNom = vehicule.getMarque() != null ? vehicule.getMarque().getNom() : "Inconnu";
        String modeleNom = vehicule.getModele() != null ? vehicule.getModele().getNom() : "Inconnu";
        
        HistoriqueEstimation historique = HistoriqueEstimation.builder()
                .vehiculeId(vehicule.getId())
                .marque(marqueNom)
                .modele(modeleNom)
                .anneeFabrication(vehicule.getAnneeFabrication())
                .kilometrage(estimation.getKilometrage())
                .etatVehicule(estimation.getEtatVehicule())
                .prixEstime(estimation.getPrixEstime())
                .prixMinimum(estimation.getPrixMinimum())
                .prixMaximum(estimation.getPrixMaximum())
                .scoreCondition(estimation.getScoreCondition())
                .recommandation(estimation.getRecommandation())
                .build();
        
        historiqueEstimationRepository.save(historique);
        log.info("Estimation sauvegardée dans l'historique pour le véhicule {}", vehicule.getId());
    }

    private void validateStatutTransition(StatutTradeIn current, StatutTradeIn next) {
        switch (current) {
            case EN_ATTENTE:
                if (next != StatutTradeIn.EN_COURS_EVALUATION && 
                    next != StatutTradeIn.REJETEE && 
                    next != StatutTradeIn.ANNULEE) {
                    throw new InvalidOperationException("Transition invalide: " + current + " -> " + next);
                }
                break;
            case EN_COURS_EVALUATION:
                if (next != StatutTradeIn.EVALUATION_TERMINEE && 
                    next != StatutTradeIn.REJETEE) {
                    throw new InvalidOperationException("Transition invalide: " + current + " -> " + next);
                }
                break;
            case EVALUATION_TERMINEE:
                if (next != StatutTradeIn.ACCEPTE && 
                    next != StatutTradeIn.REJETEE) {
                    throw new InvalidOperationException("Transition invalide: " + current + " -> " + next);
                }
                break;
            case ACCEPTE:
            case REJETEE:
            case ANNULEE:
                throw new InvalidOperationException("Impossible de modifier le statut d'une demande " + current);
        }
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

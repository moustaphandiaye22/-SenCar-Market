package com.sencarmarket.module.paiement.service;

import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.paiement.dto.*;
import com.sencarmarket.module.paiement.entity.Paiement;
import com.sencarmarket.module.paiement.entity.PaiementLog;
import com.sencarmarket.module.paiement.entity.Portefeuille;
import com.sencarmarket.module.paiement.entity.TransactionPortefeuille;
import com.sencarmarket.module.paiement.enums.StatutPaiement;
import com.sencarmarket.module.paiement.enums.StatutTransaction;
import com.sencarmarket.module.paiement.enums.TypeTransaction;
import com.sencarmarket.module.paiement.mapper.IPaiementMapper;
import com.sencarmarket.module.paiement.repository.PaiementLogRepository;
import com.sencarmarket.module.paiement.repository.PaiementRepository;
import com.sencarmarket.module.paiement.repository.PortefeuilleRepository;
import com.sencarmarket.module.paiement.repository.TransactionPortefeuilleRepository;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
public class PaiementService implements IPaiementService {

    private final PaiementRepository paiementRepository;
    private final PortefeuilleRepository portefeuilleRepository;
    private final TransactionPortefeuilleRepository transactionRepository;
    private final PaiementLogRepository paiementLogRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final IPaiementMapper paiementMapper;

    @Value("${paiements.commission.taux:0.05}")
    private BigDecimal tauxCommission;

    @Value("${paiements.wave.secret:}")
    private String waveSecret;

    @Value("${paiements.om.secret:}")
    private String omSecret;

    // ========== PAIEMENT ==========

    @Override
    @Transactional
    public PaiementResponse createPaiement(CreatePaiementRequest request) {
        log.info("Création d'un paiement pour l'utilisateur: {}", request.getUtilisateurId());

        Utilisateur utilisateur = utilisateurRepository.findById(request.getUtilisateurId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", request.getUtilisateurId()));

        // Calcul de la commission si escrow
        BigDecimal commission = BigDecimal.ZERO;
        BigDecimal montantEscrow = request.getMontant();
        if (Boolean.TRUE.equals(request.getIsEscrow())) {
            commission = calculateCommission(request.getMontant());
            montantEscrow = request.getMontant().subtract(commission);
        }

        Paiement paiement = Paiement.builder()
                .utilisateur(utilisateur)
                .montant(request.getMontant())
                .montantEscrow(montantEscrow)
                .commission(commission)
                .methodePaiement(request.getMethodePaiement())
                .statut(StatutPaiement.EN_ATTENTE)
                .isEscrow(request.getIsEscrow() != null && request.getIsEscrow())
                .referenceTransaction(UUID.randomUUID().toString())
                .build();

        paiement = paiementRepository.save(paiement);

        // Créer le log
        createLogAction(paiement.getId(), "CREATION", "Paiement créé");

        log.info("Paiement créé avec succès: ID={}", paiement.getId());
        return paiementMapper.toPaiementResponse(paiement);
    }

    @Override
    @Transactional
    public PaiementResponse createPaiementWave(CreatePaiementRequest request) {
        log.info("Création d'un paiement Wave pour l'utilisateur: {}", request.getUtilisateurId());

        PaiementResponse paiement = createPaiement(request);

        // TODO: Intégrer l'API Wave pour générer le payment URL
        String paymentUrl = "https://wave.com/pay/" + UUID.randomUUID().toString().substring(0, 8);
        paiement.setUrlPaiement(paymentUrl);

        return paiement;
    }

    @Override
    @Transactional
    public PaiementResponse createPaiementOrangeMoney(CreatePaiementRequest request) {
        log.info("Création d'un paiement Orange Money pour l'utilisateur: {}", request.getUtilisateurId());

        PaiementResponse paiement = createPaiement(request);

        // TODO: Intégrer l'API Orange Money
        String paymentUrl = "https://om.sn/pay/" + UUID.randomUUID().toString().substring(0, 8);
        paiement.setUrlPaiement(paymentUrl);

        return paiement;
    }

    @Override
    @Transactional
    public PaiementResponse updateStatutPaiement(UUID id, String nouveauStatut) {
        log.info("Mise à jour du statut du paiement: {}", id);

        Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement", "id", id));

        StatutPaiement ancienStatut = paiement.getStatut();
        paiement.setStatut(StatutPaiement.valueOf(nouveauStatut.toUpperCase()));
        
        if (paiement.getStatut() == StatutPaiement.CONFIRME) {
            paiement.setDatePaiement(LocalDateTime.now());
        }

        paiement = paiementRepository.save(paiement);

        createLogAction(id, "STATUT_UPDATE", 
                String.format("Statut changé: %s -> %s", ancienStatut, paiement.getStatut()));

        log.info("Statut du paiement mis à jour: {} -> {}", ancienStatut, paiement.getStatut());
        return paiementMapper.toPaiementResponse(paiement);
    }

    @Override
    @Transactional
    public PaiementResponse confirmerPaiement(UUID id, String referenceExterne) {
        log.info("Confirmation du paiement: {}", id);

        Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement", "id", id));

        paiement.setStatut(StatutPaiement.CONFIRME);
        paiement.setReferenceExterne(referenceExterne);
        paiement.setDatePaiement(LocalDateTime.now());
        
        paiement = paiementRepository.save(paiement);

        createLogAction(id, "CONFIRMATION", 
                String.format("Paiement confirmé avec référence externe: %s", referenceExterne));

        // Si c'est un escrow, bloquer les fonds
        if (Boolean.TRUE.equals(paiement.getIsEscrow()) && paiement.getUtilisateur() != null) {
            try {
                bloquerFondsEscrow(paiement.getUtilisateur().getId(), 
                        paiement.getMontantEscrow(), paiement.getReferenceTransaction());
            } catch (Exception e) {
                log.error("Erreur lors du blocage des fonds escrow: {}", e.getMessage());
            }
        }

        log.info("Paiement confirmé: {}", id);
        return paiementMapper.toPaiementResponse(paiement);
    }

    @Override
    @Transactional
    public PaiementResponse annulerPaiement(UUID id) {
        return updateStatutPaiement(id, "ANNULE");
    }

    @Override
    @Transactional
    public PaiementResponse remboursementPaiement(UUID id, BigDecimal montant) {
        log.info("Remboursement du paiement: {}", id);

        Paiement paiement = paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement", "id", id));

        paiement.setStatut(StatutPaiement.REMBOURSE);
        paiement = paiementRepository.save(paiement);

        createLogAction(id, "REMBOURSEMENT", 
                String.format("Remboursement de %s", montant));

        return paiementMapper.toPaiementResponse(paiement);
    }

    @Override
    public Paiement getPaiementById(UUID id) {
        return paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement", "id", id));
    }
    
    @Override
    public PaiementResponse getPaiementResponseById(UUID id) {
        return paiementMapper.toPaiementResponse(getPaiementById(id));
    }

    @Override
    public List<PaiementResponse> getPaiementsByUtilisateur(UUID utilisateurId) {
        return paiementRepository.findByUtilisateurId(utilisateurId).stream()
                .map(paiementMapper::toPaiementResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaiementResponse> getPaiementsByReservation(UUID reservationId) {
        return paiementRepository.findByReservationId(reservationId).stream()
                .map(paiementMapper::toPaiementResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaiementResponse> getPaiementsByStatut(String statut) {
        return paiementRepository.findByStatut(StatutPaiement.valueOf(statut.toUpperCase())).stream()
                .map(paiementMapper::toPaiementResponse)
                .collect(Collectors.toList());
    }

    // ========== WEBHOOK ==========

    @Override
    public String processWaveWebhook(String payload, String signature) {
        log.info("Traitement du webhook Wave");

        if (!verifyWebhookSignature(payload, signature, waveSecret)) {
            log.warn("Signature Wave invalide");
            return "INVALID_SIGNATURE";
        }

        // TODO: Parser le payload et extraire les informations
        // Confirmer le paiement automatiquement
        
        return "SUCCESS";
    }

    @Override
    public String processOrangeMoneyWebhook(String payload, String signature) {
        log.info("Traitement du webhook Orange Money");

        if (!verifyWebhookSignature(payload, signature, omSecret)) {
            log.warn("Signature Orange Money invalide");
            return "INVALID_SIGNATURE";
        }

        // TODO: Parser le payload et extraire les informations
        
        return "SUCCESS";
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature, String secret) {
        if (secret == null || secret.isBlank()) {
            log.warn("Secret non configuré, signature non vérifiée");
            return true; // En mode développement
        }
        
        // TODO: Implémenter la vérification de signature avec HMAC-SHA256
        return true;
    }

    // ========== PAIEMENT LOG ==========

    @Override
    public PaiementLog createLog(PaiementLog log) {
        return paiementLogRepository.save(log);
    }

    private void createLogAction(UUID paiementId, String action, String details) {
        PaiementLog log = PaiementLog.builder()
                .paiementId(paiementId)
                .action(action)
                .details(details)
                .dateAction(LocalDateTime.now())
                .build();
        paiementLogRepository.save(log);
    }

    @Override
    public List<PaiementLog> getLogsByPaiement(UUID paiementId) {
        return paiementLogRepository.findByPaiementIdOrderByDateActionDesc(paiementId);
    }

    // ========== PORTEFEUILLE ==========

    @Override
    @Transactional
    public PortefeuilleResponse getOrCreatePortefeuille(UUID utilisateurId) {
        log.debug("Récupération ou création du portefeuille pour l'utilisateur: {}", utilisateurId);

        return portefeuilleRepository.findByUtilisateurId(utilisateurId)
                .map(paiementMapper::toPortefeuilleResponse)
                .orElseGet(() -> {
                    Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", utilisateurId));

                    Portefeuille portefeuille = Portefeuille.builder()
                            .utilisateur(utilisateur)
                            .solde(BigDecimal.ZERO)
                            .soldeBloque(BigDecimal.ZERO)
                            .isActif(true)
                            .build();

                    portefeuille = portefeuilleRepository.save(portefeuille);
                    log.info("Portefeuille créé pour l'utilisateur: {}", utilisateurId);
                    return paiementMapper.toPortefeuilleResponse(portefeuille);
                });
    }

    @Override
    public PortefeuilleResponse getPortefeuilleByUtilisateur(UUID utilisateurId) {
        return portefeuilleRepository.findByUtilisateurId(utilisateurId)
                .map(paiementMapper::toPortefeuilleResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public PortefeuilleResponse crediterPortefeuille(UUID utilisateurId, TransactionPortefeuilleRequest request) {
        log.info("Crédit du portefeuille: {} de {}", utilisateurId, request.getMontant());

        Portefeuille portefeuille = getOrCreatePortefeuilleEntity(utilisateurId);
        
        // Créer la transaction avec helper method
        TransactionPortefeuille transaction = creerTransaction(
                portefeuille,
                request.getMontant(),
                TypeTransaction.CREDIT,
                StatutTransaction.CONFIRMEE,
                request.getDescription(),
                request.getReferencePaiement()
        );
        
        transactionRepository.save(transaction);
        
        // Mettre à jour le solde
        portefeuille.setSolde(portefeuille.getSolde().add(request.getMontant()));
        portefeuille.setDateDerniereRecharge(LocalDateTime.now());
        portefeuille = portefeuilleRepository.save(portefeuille);

        createLogAction(null, "CREDIT", 
                String.format("Crédit de %s - %s", request.getMontant(), request.getDescription()));

        log.info("Portefeuille crédité: nouveau solde = {}", portefeuille.getSolde());
        return paiementMapper.toPortefeuilleResponse(portefeuille);
    }

    @Override
    @Transactional
    public PortefeuilleResponse debiterPortefeuille(UUID utilisateurId, TransactionPortefeuilleRequest request) {
        log.info("Débit du portefeuille: {} de {}", utilisateurId, request.getMontant());

        Portefeuille portefeuille = getOrCreatePortefeuilleEntity(utilisateurId);
        
        BigDecimal soldeDisponible = portefeuille.getSoldeDisponible();
        if (soldeDisponible.compareTo(request.getMontant()) < 0) {
            throw new RuntimeException("Solde insuffisant");
        }
        
        // Créer la transaction avec helper method
        TransactionPortefeuille transaction = creerTransaction(
                portefeuille,
                request.getMontant(),
                TypeTransaction.DEBIT,
                StatutTransaction.CONFIRMEE,
                request.getDescription(),
                request.getReferencePaiement()
        );
        
        transactionRepository.save(transaction);
        
        // Mettre à jour le solde
        portefeuille.setSolde(portefeuille.getSolde().subtract(request.getMontant()));
        portefeuille = portefeuilleRepository.save(portefeuille);

        createLogAction(null, "DEBIT", 
                String.format("Débit de %s - %s", request.getMontant(), request.getDescription()));

        log.info("Portefeuille débité: nouveau solde = {}", portefeuille.getSolde());
        return paiementMapper.toPortefeuilleResponse(portefeuille);
    }

    @Override
    @Transactional
    public TransactionResponse demanderRetrait(UUID utilisateurId, RetraitRequest request) {
        log.info("Demande de retrait: {} de {}", utilisateurId, request.getMontant());

        Portefeuille portefeuille = getOrCreatePortefeuilleEntity(utilisateurId);
        
        BigDecimal soldeDisponible = portefeuille.getSoldeDisponible();
        if (soldeDisponible.compareTo(request.getMontant()) < 0) {
            throw new RuntimeException("Solde insuffisant pour le retrait");
        }
        
        // Créer la transaction avec helper method
        TransactionPortefeuille transaction = creerTransaction(
                portefeuille,
                request.getMontant(),
                TypeTransaction.RETRAIT,
                StatutTransaction.EN_ATTENTE,
                String.format("Retrait vers %s - %s", request.getTelephone(), request.getNomBeneficiaire()),
                null
        );
        
        transaction = transactionRepository.save(transaction);
        
        // Bloquer les fonds
        portefeuille.setSoldeBloque(portefeuille.getSoldeBloque().add(request.getMontant()));
        portefeuille = portefeuilleRepository.save(portefeuille);

        log.info("Demande de retrait créée: {}", transaction.getId());
        return paiementMapper.toTransactionResponse(transaction);
    }

    @Override
    @Transactional
    public PortefeuilleResponse bloquerFondsEscrow(UUID utilisateurId, BigDecimal montant, String reference) {
        log.info("Blocage des fonds escrow: {} de {} - {}", utilisateurId, montant, reference);

        Portefeuille portefeuille = getOrCreatePortefeuilleEntity(utilisateurId);
        
        BigDecimal soldeDisponible = portefeuille.getSoldeDisponible();
        if (soldeDisponible.compareTo(montant) < 0) {
            throw new RuntimeException("Solde disponible insuffisant pour bloquer");
        }
        
        // Créer la transaction avec helper method
        TransactionPortefeuille transaction = creerTransaction(
                portefeuille,
                montant,
                TypeTransaction.ESCROW_DEPOSIT,
                StatutTransaction.CONFIRMEE,
                "Blocage fonds escrow - " + reference,
                reference
        );
        
        transactionRepository.save(transaction);
        
        // Bloquer les fonds
        portefeuille.setSoldeBloque(portefeuille.getSoldeBloque().add(montant));
        portefeuille = portefeuilleRepository.save(portefeuille);

        log.info("Fonds escrow bloqués: {}", montant);
        return paiementMapper.toPortefeuilleResponse(portefeuille);
    }

    @Override
    @Transactional
    public PortefeuilleResponse libererFondsEscrow(UUID utilisateurId, BigDecimal montant, String reference) {
        log.info("Libération des fonds escrow: {} de {} - {}", utilisateurId, montant, reference);

        Portefeuille portefeuille = getOrCreatePortefeuilleEntity(utilisateurId);
        
        // Créer la transaction avec helper method
        TransactionPortefeuille transaction = creerTransaction(
                portefeuille,
                montant,
                TypeTransaction.ESCROW_RELEASE,
                StatutTransaction.CONFIRMEE,
                "Libération fonds escrow - " + reference,
                reference
        );
        
        transactionRepository.save(transaction);
        
        // Débloquer les fonds
        portefeuille.setSoldeBloque(portefeuille.getSoldeBloque().subtract(montant));
        portefeuille = portefeuilleRepository.save(portefeuille);

        log.info("Fonds escrow libérés: {}", montant);
        return paiementMapper.toPortefeuilleResponse(portefeuille);
    }

    @Override
    @Transactional
    public PortefeuilleResponse remboursementEscrow(UUID utilisateurId, BigDecimal montant, String reference) {
        log.info("Remboursement des fonds escrow: {} de {} - {}", utilisateurId, montant, reference);

        Portefeuille portefeuille = getOrCreatePortefeuilleEntity(utilisateurId);
        
        // Créer la transaction
        TransactionPortefeuille transaction = TransactionPortefeuille.builder()
                .portefeuille(portefeuille)
                .montant(montant)
                .typeTransaction(TypeTransaction.ESCROW_REFUND)
                .statut(StatutTransaction.CONFIRMEE)
                .description("Remboursement escrow - " + reference)
                .referenceExterne(reference)
                .build();
        
        transactionRepository.save(transaction);
        
        // Débloquer les fonds
        portefeuille.setSoldeBloque(portefeuille.getSoldeBloque().subtract(montant));
        portefeuille = portefeuilleRepository.save(portefeuille);

        log.info("Fonds escrow remboursés: {}", montant);
        return paiementMapper.toPortefeuilleResponse(portefeuille);
    }

    // ========== TRANSACTION ==========

    @Override
    public TransactionPortefeuille createTransaction(TransactionPortefeuille transaction) {
        return transactionRepository.save(transaction);
    }

    @Override
    public TransactionPortefeuille getTransactionById(UUID id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
    }
    
    @Override
    public TransactionResponse getTransactionResponseById(UUID id) {
        return paiementMapper.toTransactionResponse(getTransactionById(id));
    }

    @Override
    public List<TransactionResponse> getTransactionsByPortefeuille(UUID portefeuilleId) {
        return transactionRepository.findByPortefeuilleIdOrderByDateTransactionDesc(portefeuilleId).stream()
                .map(paiementMapper::toTransactionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionResponse> getTransactionsByUtilisateur(UUID utilisateurId) {
        Portefeuille portefeuille = portefeuilleRepository.findByUtilisateurId(utilisateurId)
                .orElse(null);
        
        if (portefeuille == null) {
            return List.of();
        }
        
        return transactionRepository.findByPortefeuilleIdOrderByDateTransactionDesc(portefeuille.getId()).stream()
                .map(paiementMapper::toTransactionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionResponse> getHistoriqueTransactions(UUID utilisateurId) {
        return getTransactionsByUtilisateur(utilisateurId);
    }

    // ========== ESCROW ==========

    @Override
    @Transactional
    public PaiementResponse createPaiementEscrow(CreatePaiementRequest request) {
        log.info("Création d'un paiement escrow pour l'utilisateur: {}", request.getUtilisateurId());
        
        request.setIsEscrow(true);
        if (request.getCommissionEscrow() == null) {
            request.setCommissionEscrow(calculateCommission(request.getMontant()));
        }
        
        return createPaiement(request);
    }

    @Override
    @Transactional
    public PaiementResponse confirmerReceptionEtLiberer(UUID paiementId) {
        log.info("Confirmation de réception et libération des fonds pour: {}", paiementId);

        Paiement paiement = paiementRepository.findById(paiementId)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement", "id", paiementId));

        // Confirmer le paiement
        paiement.setStatut(StatutPaiement.CONFIRME);
        paiement.setDatePaiement(LocalDateTime.now());
        paiement = paiementRepository.save(paiement);

        // Libérer les fonds escrow au propriétaire
        if (Boolean.TRUE.equals(paiement.getIsEscrow()) && paiement.getReservation() != null) {
            var reservation = paiement.getReservation();
            if (reservation.getAnnonceLocation() != null) {
                var proprietaire = reservation.getAnnonceLocation().getProprietaire();
                if (proprietaire != null) {
                    libererFondsEscrow(proprietaire.getId(), paiement.getMontantEscrow(), 
                            paiement.getReferenceTransaction());
                }
            }
        }

        createLogAction(paiementId, "ESCROW_RELEASE", "Fonds escrow libérés");

        return paiementMapper.toPaiementResponse(paiement);
    }

    @Override
    public BigDecimal calculateCommission(BigDecimal montant) {
        return montant.multiply(tauxCommission)
                .setScale(2, RoundingMode.HALF_UP);
    }

    // ========== HELPER METHODS ==========

    private Portefeuille getOrCreatePortefeuilleEntity(UUID utilisateurId) {
        return portefeuilleRepository.findByUtilisateurId(utilisateurId)
                .orElseGet(() -> {
                    Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", utilisateurId));

                    Portefeuille portefeuille = Portefeuille.builder()
                            .utilisateur(utilisateur)
                            .solde(BigDecimal.ZERO)
                            .soldeBloque(BigDecimal.ZERO)
                            .isActif(true)
                            .build();

                    return portefeuilleRepository.save(portefeuille);
                });
    }
    
    /**
     * Méthode helper pour créer une transaction (DRY)
     */
    private TransactionPortefeuille creerTransaction(Portefeuille portefeuille, BigDecimal montant, 
            TypeTransaction typeTransaction, StatutTransaction statut, String description, String referenceExterne) {
        return TransactionPortefeuille.builder()
                .portefeuille(portefeuille)
                .montant(montant)
                .typeTransaction(typeTransaction)
                .statut(statut)
                .description(description)
                .referenceExterne(referenceExterne)
                .build();
    }

    @Override
    public PaiementResponse mapToPaiementResponse(Paiement paiement) {
        return paiementMapper.toPaiementResponse(paiement);
    }

    @Override
    public TransactionResponse mapToTransactionResponse(TransactionPortefeuille transaction) {
        return paiementMapper.toTransactionResponse(transaction);
    }
}

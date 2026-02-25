package com.sencarmarket.module.paiement.service;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.paiement.dto.PortefeuilleResponse;
import com.sencarmarket.module.paiement.dto.RetraitRequest;
import com.sencarmarket.module.paiement.dto.TransactionPortefeuilleRequest;
import com.sencarmarket.module.paiement.dto.TransactionResponse;
import com.sencarmarket.module.paiement.entity.Portefeuille;
import com.sencarmarket.module.paiement.entity.TransactionPortefeuille;
import com.sencarmarket.module.paiement.enums.StatutTransaction;
import com.sencarmarket.module.paiement.enums.TypeTransaction;
import com.sencarmarket.module.paiement.mapper.IPaiementMapper;
import com.sencarmarket.module.paiement.repository.PortefeuilleRepository;
import com.sencarmarket.module.paiement.repository.TransactionPortefeuilleRepository;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PortefeuilleTransactionService {

    private static final String RESOURCE_UTILISATEUR = "Utilisateur";

    private final PortefeuilleRepository portefeuilleRepository;
    private final TransactionPortefeuilleRepository transactionRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final IPaiementMapper paiementMapper;
    private final PaiementLogService paiementLogService;

    @Transactional
    public PortefeuilleResponse getOrCreatePortefeuille(UUID utilisateurId) {
        return portefeuilleRepository.findByUtilisateurId(utilisateurId)
                .map(paiementMapper::toPortefeuilleResponse)
                .orElseGet(() -> {
                    Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                            .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_UTILISATEUR, "id", utilisateurId));
                    Portefeuille portefeuille = Portefeuille.builder()
                            .utilisateur(utilisateur)
                            .solde(BigDecimal.ZERO)
                            .soldeBloque(BigDecimal.ZERO)
                            .isActif(true)
                            .build();
                    return paiementMapper.toPortefeuilleResponse(portefeuilleRepository.save(portefeuille));
                });
    }

    public PortefeuilleResponse getPortefeuilleByUtilisateur(UUID utilisateurId) {
        return portefeuilleRepository.findByUtilisateurId(utilisateurId)
                .map(paiementMapper::toPortefeuilleResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Portefeuille", "utilisateurId", utilisateurId));
    }

    @Transactional
    public PortefeuilleResponse crediterPortefeuille(UUID utilisateurId, TransactionPortefeuilleRequest request) {
        Portefeuille portefeuille = getOrCreatePortefeuilleEntity(utilisateurId);
        TransactionPortefeuille transaction = createTransactionEntity(
                portefeuille, request.getMontant(), TypeTransaction.CREDIT, StatutTransaction.CONFIRMEE,
                request.getDescription(), request.getReferencePaiement());
        transactionRepository.save(transaction);
        portefeuille.setSolde(portefeuille.getSolde().add(request.getMontant()));
        portefeuille.setDateDerniereRecharge(LocalDateTime.now());
        portefeuille = portefeuilleRepository.save(portefeuille);
        paiementLogService.createLogAction(null, "CREDIT",
                String.format("Crédit de %s - %s", request.getMontant(), request.getDescription()));
        return paiementMapper.toPortefeuilleResponse(portefeuille);
    }

    @Transactional
    public PortefeuilleResponse debiterPortefeuille(UUID utilisateurId, TransactionPortefeuilleRequest request) {
        Portefeuille portefeuille = getOrCreatePortefeuilleEntity(utilisateurId);
        if (portefeuille.getSoldeDisponible().compareTo(request.getMontant()) < 0) {
            throw new InvalidOperationException(AppMessages.WALLET_INSUFFICIENT_BALANCE_OPERATION);
        }
        TransactionPortefeuille transaction = createTransactionEntity(
                portefeuille, request.getMontant(), TypeTransaction.DEBIT, StatutTransaction.CONFIRMEE,
                request.getDescription(), request.getReferencePaiement());
        transactionRepository.save(transaction);
        portefeuille.setSolde(portefeuille.getSolde().subtract(request.getMontant()));
        portefeuille = portefeuilleRepository.save(portefeuille);
        paiementLogService.createLogAction(null, "DEBIT",
                String.format("Débit de %s - %s", request.getMontant(), request.getDescription()));
        return paiementMapper.toPortefeuilleResponse(portefeuille);
    }

    @Transactional
    public TransactionResponse demanderRetrait(UUID utilisateurId, RetraitRequest request) {
        Portefeuille portefeuille = getOrCreatePortefeuilleEntity(utilisateurId);
        if (portefeuille.getSoldeDisponible().compareTo(request.getMontant()) < 0) {
            throw new InvalidOperationException(AppMessages.WALLET_INSUFFICIENT_BALANCE_WITHDRAW);
        }
        TransactionPortefeuille transaction = createTransactionEntity(
                portefeuille, request.getMontant(), TypeTransaction.RETRAIT, StatutTransaction.EN_ATTENTE,
                String.format("Retrait vers %s - %s", request.getTelephone(), request.getNomBeneficiaire()), null);
        transaction = transactionRepository.save(transaction);
        portefeuille.setSoldeBloque(portefeuille.getSoldeBloque().add(request.getMontant()));
        portefeuilleRepository.save(portefeuille);
        return paiementMapper.toTransactionResponse(transaction);
    }

    @Transactional
    public PortefeuilleResponse bloquerFondsEscrow(UUID utilisateurId, BigDecimal montant, String reference) {
        Portefeuille portefeuille = getOrCreatePortefeuilleEntity(utilisateurId);
        if (portefeuille.getSoldeDisponible().compareTo(montant) < 0) {
            throw new InvalidOperationException(AppMessages.WALLET_INSUFFICIENT_BALANCE_ESCROW);
        }
        transactionRepository.save(createTransactionEntity(
                portefeuille, montant, TypeTransaction.ESCROW_DEPOSIT, StatutTransaction.CONFIRMEE,
                "Blocage fonds escrow - " + reference, reference));
        portefeuille.setSoldeBloque(portefeuille.getSoldeBloque().add(montant));
        portefeuille = portefeuilleRepository.save(portefeuille);
        return paiementMapper.toPortefeuilleResponse(portefeuille);
    }

    @Transactional
    public PortefeuilleResponse libererFondsEscrow(UUID utilisateurId, BigDecimal montant, String reference) {
        Portefeuille portefeuille = getOrCreatePortefeuilleEntity(utilisateurId);
        transactionRepository.save(createTransactionEntity(
                portefeuille, montant, TypeTransaction.ESCROW_RELEASE, StatutTransaction.CONFIRMEE,
                "Libération fonds escrow - " + reference, reference));
        portefeuille.setSoldeBloque(portefeuille.getSoldeBloque().subtract(montant));
        portefeuille = portefeuilleRepository.save(portefeuille);
        return paiementMapper.toPortefeuilleResponse(portefeuille);
    }

    @Transactional
    public PortefeuilleResponse remboursementEscrow(UUID utilisateurId, BigDecimal montant, String reference) {
        Portefeuille portefeuille = getOrCreatePortefeuilleEntity(utilisateurId);
        transactionRepository.save(createTransactionEntity(
                portefeuille, montant, TypeTransaction.ESCROW_REFUND, StatutTransaction.CONFIRMEE,
                "Remboursement escrow - " + reference, reference));
        portefeuille.setSoldeBloque(portefeuille.getSoldeBloque().subtract(montant));
        portefeuille = portefeuilleRepository.save(portefeuille);
        return paiementMapper.toPortefeuilleResponse(portefeuille);
    }

    public TransactionPortefeuille createTransaction(TransactionPortefeuille transaction) {
        return transactionRepository.save(transaction);
    }

    public TransactionPortefeuille getTransactionById(UUID id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", id));
    }

    public TransactionResponse getTransactionResponseById(UUID id) {
        return paiementMapper.toTransactionResponse(getTransactionById(id));
    }

    public List<TransactionResponse> getTransactionsByPortefeuille(UUID portefeuilleId) {
        return transactionRepository.findByPortefeuilleIdOrderByDateTransactionDesc(portefeuilleId).stream()
                .map(paiementMapper::toTransactionResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsByUtilisateur(UUID utilisateurId) {
        return portefeuilleRepository.findByUtilisateurId(utilisateurId)
                .map(Portefeuille::getId)
                .map(transactionRepository::findByPortefeuilleIdOrderByDateTransactionDesc)
                .orElseGet(List::of)
                .stream()
                .map(paiementMapper::toTransactionResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getHistoriqueTransactions(UUID utilisateurId) {
        return getTransactionsByUtilisateur(utilisateurId);
    }

    private Portefeuille getOrCreatePortefeuilleEntity(UUID utilisateurId) {
        return portefeuilleRepository.findByUtilisateurId(utilisateurId)
                .orElseGet(() -> {
                    Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                            .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_UTILISATEUR, "id", utilisateurId));
                    Portefeuille portefeuille = Portefeuille.builder()
                            .utilisateur(utilisateur)
                            .solde(BigDecimal.ZERO)
                            .soldeBloque(BigDecimal.ZERO)
                            .isActif(true)
                            .build();
                    return portefeuilleRepository.save(portefeuille);
                });
    }

    private TransactionPortefeuille createTransactionEntity(Portefeuille portefeuille, BigDecimal montant,
                                                            TypeTransaction typeTransaction, StatutTransaction statut,
                                                            String description, String referenceExterne) {
        return TransactionPortefeuille.builder()
                .portefeuille(portefeuille)
                .montant(montant)
                .typeTransaction(typeTransaction)
                .statut(statut)
                .description(description)
                .referenceExterne(referenceExterne)
                .build();
    }
}

package com.sencarmarket.module.paiement.service;

import com.sencarmarket.module.annonce.entity.ReservationLocation;
import com.sencarmarket.module.annonce.repository.ReservationLocationRepository;
import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.paiement.dto.CreatePaiementRequest;
import com.sencarmarket.module.paiement.dto.PaiementResponse;
import com.sencarmarket.module.paiement.entity.Paiement;
import com.sencarmarket.module.paiement.enums.StatutPaiement;
import com.sencarmarket.module.paiement.mapper.IPaiementMapper;
import com.sencarmarket.module.paiement.repository.PaiementRepository;
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
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaiementCoreService {

    private static final String RESOURCE_UTILISATEUR = "Utilisateur";
    private static final String RESOURCE_RESERVATION = "ReservationLocation";

    private final PaiementRepository paiementRepository;
    private final ReservationLocationRepository reservationLocationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final IPaiementMapper paiementMapper;
    private final PaiementLogService paiementLogService;
    private final PortefeuilleTransactionService portefeuilleTransactionService;

    @Value("${paiements.commission.taux:0.05}")
    private BigDecimal tauxCommission;
    @Value("${paiements.wave.pay-url-base:https://wave.com/pay}")
    private String wavePayUrlBase;
    @Value("${paiements.om.pay-url-base:https://om.sn/pay}")
    private String omPayUrlBase;

    @Transactional
    public PaiementResponse createPaiement(CreatePaiementRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findById(request.getUtilisateurId())
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_UTILISATEUR, "id", request.getUtilisateurId()));
        ReservationLocation reservation = reservationLocationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_RESERVATION, "id", request.getReservationId()));

        BigDecimal commission = BigDecimal.ZERO;
        BigDecimal montantEscrow = request.getMontant();
        if (Boolean.TRUE.equals(request.getIsEscrow())) {
            commission = calculateCommission(request.getMontant());
            montantEscrow = request.getMontant().subtract(commission);
        }

        Paiement paiement = Paiement.builder()
                .utilisateur(utilisateur)
                .reservation(reservation)
                .montant(request.getMontant())
                .montantEscrow(montantEscrow)
                .commission(commission)
                .methodePaiement(request.getMethodePaiement())
                .statut(StatutPaiement.EN_ATTENTE)
                .isEscrow(request.getIsEscrow() != null && request.getIsEscrow())
                .referenceTransaction(UUID.randomUUID().toString())
                .build();

        paiement = paiementRepository.save(paiement);
        paiementLogService.createLogAction(paiement.getId(), "CREATION", "Paiement créé");
        return paiementMapper.toPaiementResponse(paiement);
    }

    @Transactional
    public PaiementResponse createPaiementWave(CreatePaiementRequest request) {
        PaiementResponse paiement = createPaiement(request);
        paiement.setUrlPaiement(buildPaymentUrl(wavePayUrlBase));
        return paiement;
    }

    @Transactional
    public PaiementResponse createPaiementOrangeMoney(CreatePaiementRequest request) {
        PaiementResponse paiement = createPaiement(request);
        paiement.setUrlPaiement(buildPaymentUrl(omPayUrlBase));
        return paiement;
    }

    @Transactional
    public PaiementResponse updateStatutPaiement(UUID id, String nouveauStatut) {
        Paiement paiement = getPaiementById(id);
        StatutPaiement ancienStatut = paiement.getStatut();
        paiement.setStatut(parseStatutPaiement(nouveauStatut));
        if (paiement.getStatut() == StatutPaiement.CONFIRME) {
            paiement.setDatePaiement(LocalDateTime.now());
        }
        paiement = paiementRepository.save(paiement);
        paiementLogService.createLogAction(id, "STATUT_UPDATE",
                String.format("Statut changé: %s -> %s", ancienStatut, paiement.getStatut()));
        return paiementMapper.toPaiementResponse(paiement);
    }

    @Transactional
    public PaiementResponse confirmerPaiement(UUID id, String referenceExterne) {
        Paiement paiement = getPaiementById(id);
        paiement.setStatut(StatutPaiement.CONFIRME);
        paiement.setReferenceExterne(referenceExterne);
        paiement.setDatePaiement(LocalDateTime.now());
        paiement = paiementRepository.save(paiement);
        paiementLogService.createLogAction(id, "CONFIRMATION",
                String.format("Paiement confirmé avec référence externe: %s", referenceExterne));

        if (Boolean.TRUE.equals(paiement.getIsEscrow()) && paiement.getUtilisateur() != null) {
            portefeuilleTransactionService.bloquerFondsEscrow(
                    paiement.getUtilisateur().getId(),
                    paiement.getMontantEscrow(),
                    paiement.getReferenceTransaction()
            );
        }
        return paiementMapper.toPaiementResponse(paiement);
    }

    @Transactional
    public PaiementResponse annulerPaiement(UUID id) {
        return updateStatutPaiement(id, "ANNULE");
    }

    @Transactional
    public PaiementResponse remboursementPaiement(UUID id, BigDecimal montant) {
        Paiement paiement = getPaiementById(id);
        paiement.setStatut(StatutPaiement.REMBOURSE);
        paiement = paiementRepository.save(paiement);
        paiementLogService.createLogAction(id, "REMBOURSEMENT", String.format("Remboursement de %s", montant));
        return paiementMapper.toPaiementResponse(paiement);
    }

    public Paiement getPaiementById(UUID id) {
        return paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement", "id", id));
    }

    public PaiementResponse getPaiementResponseById(UUID id) {
        return paiementMapper.toPaiementResponse(getPaiementById(id));
    }

    public List<PaiementResponse> getPaiementsByUtilisateur(UUID utilisateurId) {
        return paiementRepository.findByUtilisateurId(utilisateurId).stream()
                .map(paiementMapper::toPaiementResponse)
                .collect(Collectors.toList());
    }

    public List<PaiementResponse> getPaiementsByReservation(UUID reservationId) {
        return paiementRepository.findByReservationId(reservationId).stream()
                .map(paiementMapper::toPaiementResponse)
                .collect(Collectors.toList());
    }

    public List<PaiementResponse> getPaiementsByStatut(String statut) {
        return paiementRepository.findByStatut(parseStatutPaiement(statut)).stream()
                .map(paiementMapper::toPaiementResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaiementResponse createPaiementEscrow(CreatePaiementRequest request) {
        request.setIsEscrow(true);
        if (request.getCommissionEscrow() == null) {
            request.setCommissionEscrow(calculateCommission(request.getMontant()));
        }
        return createPaiement(request);
    }

    @Transactional
    public PaiementResponse confirmerReceptionEtLiberer(UUID paiementId) {
        Paiement paiement = getPaiementById(paiementId);
        paiement.setStatut(StatutPaiement.CONFIRME);
        paiement.setDatePaiement(LocalDateTime.now());
        paiement = paiementRepository.save(paiement);

        if (Boolean.TRUE.equals(paiement.getIsEscrow()) && paiement.getReservation() != null
                && paiement.getReservation().getAnnonceLocation() != null
                && paiement.getReservation().getAnnonceLocation().getProprietaire() != null) {
            portefeuilleTransactionService.libererFondsEscrow(
                    paiement.getReservation().getAnnonceLocation().getProprietaire().getId(),
                    paiement.getMontantEscrow(),
                    paiement.getReferenceTransaction()
            );
        }
        paiementLogService.createLogAction(paiementId, "ESCROW_RELEASE", "Fonds escrow libérés");
        return paiementMapper.toPaiementResponse(paiement);
    }

    public BigDecimal calculateCommission(BigDecimal montant) {
        return montant.multiply(tauxCommission).setScale(2, RoundingMode.HALF_UP);
    }

    private StatutPaiement parseStatutPaiement(String statut) {
        if (statut == null || statut.isBlank()) {
            throw new InvalidOperationException(AppMessages.PAIEMENT_STATUS_REQUIRED);
        }
        try {
            return StatutPaiement.valueOf(statut.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new InvalidOperationException(AppMessages.concat(AppMessages.PAIEMENT_STATUS_INVALID_PREFIX, statut));
        }
    }

    private String buildPaymentUrl(String baseUrl) {
        String normalizedBase = baseUrl != null ? baseUrl.trim() : "";
        if (normalizedBase.endsWith("/")) {
            normalizedBase = normalizedBase.substring(0, normalizedBase.length() - 1);
        }
        return normalizedBase + "/" + UUID.randomUUID().toString().substring(0, 8);
    }
}

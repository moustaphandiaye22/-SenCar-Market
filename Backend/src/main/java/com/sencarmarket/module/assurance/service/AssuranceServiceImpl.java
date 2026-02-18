package com.sencarmarket.module.assurance.service;

import com.sencarmarket.module.assurance.dto.*;
import com.sencarmarket.module.assurance.entity.OptionAssurance;
import com.sencarmarket.module.assurance.entity.ProduitAssurance;
import com.sencarmarket.module.assurance.entity.SouscriptionAssurance;
import com.sencarmarket.module.assurance.enums.StatutAssurance;
import com.sencarmarket.module.assurance.repository.OptionAssuranceRepository;
import com.sencarmarket.module.assurance.repository.ProduitAssuranceRepository;
import com.sencarmarket.module.assurance.repository.SouscriptionAssuranceRepository;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.commun.exception.ResourceNotFoundException;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import com.sencarmarket.module.vehicule.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssuranceServiceImpl implements AssuranceService {

    private final ProduitAssuranceRepository produitAssuranceRepository;
    private final OptionAssuranceRepository optionAssuranceRepository;
    private final SouscriptionAssuranceRepository subscriptionAssuranceRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final VehiculeRepository vehiculeRepository;

    @Override
    @Transactional
    public ProduitAssuranceResponse createProduitAssurance(CreateProduitAssuranceRequest request) {
        ProduitAssurance produit = ProduitAssurance.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .prixBase(request.getPrixBase())
                .typeAssurance(request.getTypeAssurance())
                .dureeMois(request.getDureeMois())
                .estActif(true)
                .build();

        produit = produitAssuranceRepository.save(produit);
        return mapToProduitResponse(produit);
    }

    @Override
    @Transactional(readOnly = true)
    public ProduitAssuranceResponse getProduitAssuranceById(UUID id) {
        ProduitAssurance produit = produitAssuranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProduitAssurance", "id", id));
        return mapToProduitResponse(produit);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<ProduitAssuranceResponse> getAllProduitAssurances(int page, int size) {
        Page<ProduitAssurance> produitPage = produitAssuranceRepository.findAll(PageRequest.of(page, size));
        
        List<ProduitAssuranceResponse> responses = produitPage.getContent().stream()
                .map(this::mapToProduitResponse)
                .collect(Collectors.toList());

        return PaginatedResponse.<ProduitAssuranceResponse>builder()
                .content(responses)
                .page(page)
                .size(size)
                .totalElements(produitPage.getTotalElements())
                .totalPages(produitPage.getTotalPages())
                .last(produitPage.isLast())
                .first(produitPage.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProduitAssuranceResponse> getActiveProduitAssurances() {
        return produitAssuranceRepository.findByEstActifTrue().stream()
                .map(this::mapToProduitResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProduitAssuranceResponse updateProduitAssurance(UUID id, CreateProduitAssuranceRequest request) {
        ProduitAssurance produit = produitAssuranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProduitAssurance", "id", id));

        produit.setNom(request.getNom());
        produit.setDescription(request.getDescription());
        produit.setPrixBase(request.getPrixBase());
        produit.setTypeAssurance(request.getTypeAssurance());
        produit.setDureeMois(request.getDureeMois());

        produit = produitAssuranceRepository.save(produit);
        return mapToProduitResponse(produit);
    }

    @Override
    @Transactional
    public void deleteProduitAssurance(UUID id) {
        ProduitAssurance produit = produitAssuranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProduitAssurance", "id", id));
        produit.setEstActif(false);
        produitAssuranceRepository.save(produit);
    }

    @Override
    @Transactional
    public OptionAssuranceResponse createOptionAssurance(CreateOptionAssuranceRequest request) {
        ProduitAssurance produit = produitAssuranceRepository.findById(request.getProduitAssuranceId())
                .orElseThrow(() -> new ResourceNotFoundException("ProduitAssurance", "id", request.getProduitAssuranceId()));

        OptionAssurance option = OptionAssurance.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .prixSupplementaire(request.getPrixSupplementaire())
                .produitAssurance(produit)
                .estActif(true)
                .build();

        option = optionAssuranceRepository.save(option);
        return mapToOptionResponse(option);
    }

    @Override
    @Transactional(readOnly = true)
    public OptionAssuranceResponse getOptionAssuranceById(UUID id) {
        OptionAssurance option = optionAssuranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OptionAssurance", "id", id));
        return mapToOptionResponse(option);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OptionAssuranceResponse> getOptionsByProduitAssurance(UUID produitAssuranceId) {
        return optionAssuranceRepository.findByProduitAssuranceId(produitAssuranceId).stream()
                .map(this::mapToOptionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OptionAssuranceResponse updateOptionAssurance(UUID id, CreateOptionAssuranceRequest request) {
        OptionAssurance option = optionAssuranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OptionAssurance", "id", id));

        if (!option.getProduitAssurance().getId().equals(request.getProduitAssuranceId())) {
            ProduitAssurance produit = produitAssuranceRepository.findById(request.getProduitAssuranceId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProduitAssurance", "id", request.getProduitAssuranceId()));
            option.setProduitAssurance(produit);
        }

        option.setNom(request.getNom());
        option.setDescription(request.getDescription());
        option.setPrixSupplementaire(request.getPrixSupplementaire());

        option = optionAssuranceRepository.save(option);
        return mapToOptionResponse(option);
    }

    @Override
    @Transactional
    public void deleteOptionAssurance(UUID id) {
        OptionAssurance option = optionAssuranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OptionAssurance", "id", id));
        option.setEstActif(false);
        optionAssuranceRepository.save(option);
    }

    @Override
    @Transactional
    public SouscriptionAssuranceResponse createSouscription(UUID utilisateurId, CreateSouscriptionAssuranceRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", utilisateurId));

        Vehicule vehicule = vehiculeRepository.findById(request.getVehiculeId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicule", "id", request.getVehiculeId()));

        ProduitAssurance produit = produitAssuranceRepository.findById(request.getProduitAssuranceId())
                .orElseThrow(() -> new ResourceNotFoundException("ProduitAssurance", "id", request.getProduitAssuranceId()));

        // Calculate total price
        BigDecimal montantTotal = calculateTotalPrice(produit, request.getOptionIds());

        // Get selected options
        List<OptionAssurance> selectedOptions = new ArrayList<>();
        if (request.getOptionIds() != null && !request.getOptionIds().isEmpty()) {
            selectedOptions = optionAssuranceRepository.findAllById(request.getOptionIds());
        }

        // Calculate dates
        LocalDateTime dateDebut = LocalDateTime.now();
        LocalDateTime dateFin = produit.getDureeMois() != null 
                ? dateDebut.plusMonths(produit.getDureeMois())
                : dateDebut.plusYears(1);

        SouscriptionAssurance subscription = SouscriptionAssurance.builder()
                .utilisateur(utilisateur)
                .vehicule(vehicule)
                .produitAssurance(produit)
                .optionsSelectionnees(selectedOptions)
                .montantTotal(montantTotal)
                .statut(StatutAssurance.EN_ATTENTE)
                .dateDebut(dateDebut)
                .dateFin(dateFin)
                .build();

        subscription = subscriptionAssuranceRepository.save(subscription);
        return mapToSouscriptionResponse(subscription);
    }

    @Override
    @Transactional(readOnly = true)
    public SouscriptionAssuranceResponse getSouscriptionById(UUID id) {
        SouscriptionAssurance subscription = subscriptionAssuranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SouscriptionAssurance", "id", id));
        return mapToSouscriptionResponse(subscription);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SouscriptionAssuranceResponse> getSouscriptionsByUtilisateur(UUID utilisateurId) {
        return subscriptionAssuranceRepository.findByUtilisateurId(utilisateurId).stream()
                .map(this::mapToSouscriptionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SouscriptionAssuranceResponse calculatePrix(UUID produitAssuranceId, List<UUID> optionIds) {
        ProduitAssurance produit = produitAssuranceRepository.findById(produitAssuranceId)
                .orElseThrow(() -> new ResourceNotFoundException("ProduitAssurance", "id", produitAssuranceId));

        BigDecimal montantTotal = calculateTotalPrice(produit, optionIds);

        List<OptionAssuranceResponse> optionResponses = new ArrayList<>();
        if (optionIds != null && !optionIds.isEmpty()) {
            optionResponses = optionAssuranceRepository.findAllById(optionIds).stream()
                    .map(this::mapToOptionResponse)
                    .collect(Collectors.toList());
        }

        return SouscriptionAssuranceResponse.builder()
                .produitAssuranceId(produit.getId())
                .produitAssuranceNom(produit.getNom())
                .optionsSelectionnees(optionResponses)
                .montantTotal(montantTotal)
                .build();
    }

    @Override
    @Transactional
    public SouscriptionAssuranceResponse processPayment(UUID subscriptionId, UUID paiementId) {
        SouscriptionAssurance subscription = subscriptionAssuranceRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("SouscriptionAssurance", "id", subscriptionId));

        // Validate status before payment
        if (subscription.getStatut() != StatutAssurance.EN_ATTENTE) {
            throw new InvalidOperationException(
                "Impossible de traiter le paiement. Le statut actuel est : " + subscription.getStatut() + 
                ". Seul le statut EN_ATTENTE permet un paiement.");
        }

        // Update payment ID and status
        subscription.setPaiementId(paiementId);
        subscription.setStatut(StatutAssurance.PAYEE);

        subscription = subscriptionAssuranceRepository.save(subscription);
        return mapToSouscriptionResponse(subscription);
    }

    @Override
    @Transactional
    public SouscriptionAssuranceResponse generateContract(UUID subscriptionId) {
        SouscriptionAssurance subscription = subscriptionAssuranceRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("SouscriptionAssurance", "id", subscriptionId));

        // Validate that payment was made before generating contract
        if (subscription.getStatut() != StatutAssurance.PAYEE) {
            throw new InvalidOperationException(
                "Impossible de générer le contrat. Le paiement doit être confirmé avant la génération du contrat.");
        }

        // Generate contract URL (in real app, this would generate a PDF)
        String contractUrl = "/contracts/" + subscription.getNumeroContrat() + ".pdf";
        subscription.setDocumentUrl(contractUrl);
        subscription.setStatut(StatutAssurance.ACTIVE);

        subscription = subscriptionAssuranceRepository.save(subscription);
        return mapToSouscriptionResponse(subscription);
    }

    @Override
    @Transactional
    public SouscriptionAssuranceResponse uploadDocument(UUID subscriptionId, String documentType, String documentUrl) {
        SouscriptionAssurance subscription = subscriptionAssuranceRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("SouscriptionAssurance", "id", subscriptionId));

        // Store document URL
        subscription.setDocumentUrl(documentUrl);

        subscription = subscriptionAssuranceRepository.save(subscription);
        return mapToSouscriptionResponse(subscription);
    }

    // Helper methods
    private BigDecimal calculateTotalPrice(ProduitAssurance produit, List<UUID> optionIds) {
        BigDecimal total = produit.getPrixBase();
        
        if (optionIds != null && !optionIds.isEmpty()) {
            List<OptionAssurance> options = optionAssuranceRepository.findAllById(optionIds);
            for (OptionAssurance option : options) {
                total = total.add(option.getPrixSupplementaire());
            }
        }
        
        return total;
    }

    private ProduitAssuranceResponse mapToProduitResponse(ProduitAssurance produit) {
        List<OptionAssuranceResponse> options = optionAssuranceRepository
                .findByProduitAssuranceId(produit.getId()).stream()
                .map(this::mapToOptionResponse)
                .collect(Collectors.toList());

        return ProduitAssuranceResponse.builder()
                .id(produit.getId())
                .nom(produit.getNom())
                .description(produit.getDescription())
                .prixBase(produit.getPrixBase())
                .typeAssurance(produit.getTypeAssurance())
                .dureeMois(produit.getDureeMois())
                .estActif(produit.getEstActif())
                .options(options)
                .createdAt(produit.getCreatedAt())
                .updatedAt(produit.getUpdatedAt())
                .build();
    }

    private OptionAssuranceResponse mapToOptionResponse(OptionAssurance option) {
        return OptionAssuranceResponse.builder()
                .id(option.getId())
                .nom(option.getNom())
                .description(option.getDescription())
                .prixSupplementaire(option.getPrixSupplementaire())
                .produitAssuranceId(option.getProduitAssurance().getId())
                .estActif(option.getEstActif())
                .createdAt(option.getCreatedAt())
                .updatedAt(option.getUpdatedAt())
                .build();
    }

    private SouscriptionAssuranceResponse mapToSouscriptionResponse(SouscriptionAssurance subscription) {
        List<OptionAssuranceResponse> options = subscription.getOptionsSelectionnees().stream()
                .map(this::mapToOptionResponse)
                .collect(Collectors.toList());

        return SouscriptionAssuranceResponse.builder()
                .id(subscription.getId())
                .utilisateurId(subscription.getUtilisateur().getId())
                .utilisateurNom(subscription.getUtilisateur().getNom())
                .vehiculeId(subscription.getVehicule().getId())
                .vehiculeDescription(subscription.getVehicule().getMarque() + " " + subscription.getVehicule().getModele())
                .produitAssuranceId(subscription.getProduitAssurance().getId())
                .produitAssuranceNom(subscription.getProduitAssurance().getNom())
                .optionsSelectionnees(options)
                .montantTotal(subscription.getMontantTotal())
                .statut(subscription.getStatut())
                .dateDebut(subscription.getDateDebut())
                .dateFin(subscription.getDateFin())
                .numeroContrat(subscription.getNumeroContrat())
                .documentUrl(subscription.getDocumentUrl())
                .paiementId(subscription.getPaiementId())
                .createdAt(subscription.getCreatedAt())
                .updatedAt(subscription.getUpdatedAt())
                .build();
    }
}

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
import com.sencarmarket.module.commun.service.PaginationService;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import com.sencarmarket.module.vehicule.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class AssuranceServiceImpl implements AssuranceService {

    private final ProduitAssuranceRepository produitAssuranceRepository;
    private final OptionAssuranceRepository optionAssuranceRepository;
    private final SouscriptionAssuranceRepository subscriptionAssuranceRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final VehiculeRepository vehiculeRepository;
    private final AssurancePricingService assurancePricingService;
    private final AssuranceLifecycleService assuranceLifecycleService;
    private final PaginationService paginationService;
    private final AssuranceResponseMapper assuranceResponseMapper;

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
        return assuranceResponseMapper.toProduitResponse(produit);
    }

    @Override
    @Transactional(readOnly = true)
    public ProduitAssuranceResponse getProduitAssuranceById(UUID id) {
        ProduitAssurance produit = produitAssuranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProduitAssurance", "id", id));
        return assuranceResponseMapper.toProduitResponse(produit);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<ProduitAssuranceResponse> getAllProduitAssurances(int page, int size) {
        Page<ProduitAssurance> produitPage = produitAssuranceRepository.findAll(PageRequest.of(page, size));
        
        List<ProduitAssuranceResponse> responses = produitPage.getContent().stream()
                .map(assuranceResponseMapper::toProduitResponse)
                .collect(Collectors.toList());

        return paginationService.build(produitPage, responses);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProduitAssuranceResponse> getActiveProduitAssurances() {
        return produitAssuranceRepository.findByEstActifTrue().stream()
                .map(assuranceResponseMapper::toProduitResponse)
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
        return assuranceResponseMapper.toProduitResponse(produit);
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
        return assuranceResponseMapper.toOptionResponse(option);
    }

    @Override
    @Transactional(readOnly = true)
    public OptionAssuranceResponse getOptionAssuranceById(UUID id) {
        OptionAssurance option = optionAssuranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OptionAssurance", "id", id));
        return assuranceResponseMapper.toOptionResponse(option);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OptionAssuranceResponse> getOptionsByProduitAssurance(UUID produitAssuranceId) {
        return optionAssuranceRepository.findByProduitAssuranceId(produitAssuranceId).stream()
                .map(assuranceResponseMapper::toOptionResponse)
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
        return assuranceResponseMapper.toOptionResponse(option);
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

        List<OptionAssurance> selectedOptions = assurancePricingService.getSelectedOptions(request.getOptionIds());
        BigDecimal montantTotal = assurancePricingService.calculateTotalPrice(produit, selectedOptions);

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
        return assuranceResponseMapper.toSouscriptionResponse(subscription);
    }

    @Override
    @Transactional(readOnly = true)
    public SouscriptionAssuranceResponse getSouscriptionById(UUID id) {
        SouscriptionAssurance subscription = subscriptionAssuranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SouscriptionAssurance", "id", id));
        return assuranceResponseMapper.toSouscriptionResponse(subscription);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SouscriptionAssuranceResponse> getSouscriptionsByUtilisateur(UUID utilisateurId) {
        return subscriptionAssuranceRepository.findByUtilisateurId(utilisateurId).stream()
                .map(assuranceResponseMapper::toSouscriptionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SouscriptionAssuranceResponse calculatePrix(UUID produitAssuranceId, List<UUID> optionIds) {
        ProduitAssurance produit = produitAssuranceRepository.findById(produitAssuranceId)
                .orElseThrow(() -> new ResourceNotFoundException("ProduitAssurance", "id", produitAssuranceId));

        List<OptionAssurance> selectedOptions = assurancePricingService.getSelectedOptions(optionIds);
        BigDecimal montantTotal = assurancePricingService.calculateTotalPrice(produit, selectedOptions);

        List<OptionAssuranceResponse> optionResponses = new ArrayList<>();
        if (!selectedOptions.isEmpty()) {
            optionResponses = selectedOptions.stream()
                    .map(assuranceResponseMapper::toOptionResponse)
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

        assuranceLifecycleService.ensureCanProcessPayment(subscription);
        assuranceLifecycleService.applyPayment(subscription, paiementId);

        subscription = subscriptionAssuranceRepository.save(subscription);
        return assuranceResponseMapper.toSouscriptionResponse(subscription);
    }

    @Override
    @Transactional
    public SouscriptionAssuranceResponse generateContract(UUID subscriptionId) {
        SouscriptionAssurance subscription = subscriptionAssuranceRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("SouscriptionAssurance", "id", subscriptionId));

        assuranceLifecycleService.ensureCanGenerateContract(subscription);
        assuranceLifecycleService.activateWithContract(subscription);

        subscription = subscriptionAssuranceRepository.save(subscription);
        return assuranceResponseMapper.toSouscriptionResponse(subscription);
    }

    @Override
    @Transactional
    public SouscriptionAssuranceResponse uploadDocument(UUID subscriptionId, String documentType, String documentUrl) {
        SouscriptionAssurance subscription = subscriptionAssuranceRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("SouscriptionAssurance", "id", subscriptionId));

        // Store document URL
        subscription.setDocumentUrl(documentUrl);

        subscription = subscriptionAssuranceRepository.save(subscription);
        return assuranceResponseMapper.toSouscriptionResponse(subscription);
    }

}

package com.sencarmarket.module.assurance.service;

import com.sencarmarket.module.assurance.dto.*;
import com.sencarmarket.module.commun.dto.PaginatedResponse;

import java.util.List;
import java.util.UUID;

public interface AssuranceService {

    // Produit Assurance
    ProduitAssuranceResponse createProduitAssurance(CreateProduitAssuranceRequest request);
    ProduitAssuranceResponse getProduitAssuranceById(UUID id);
    PaginatedResponse<ProduitAssuranceResponse> getAllProduitAssurances(int page, int size);
    List<ProduitAssuranceResponse> getActiveProduitAssurances();
    ProduitAssuranceResponse updateProduitAssurance(UUID id, CreateProduitAssuranceRequest request);
    void deleteProduitAssurance(UUID id);

    // Option Assurance
    OptionAssuranceResponse createOptionAssurance(CreateOptionAssuranceRequest request);
    OptionAssuranceResponse getOptionAssuranceById(UUID id);
    List<OptionAssuranceResponse> getOptionsByProduitAssurance(UUID produitAssuranceId);
    OptionAssuranceResponse updateOptionAssurance(UUID id, CreateOptionAssuranceRequest request);
    void deleteOptionAssurance(UUID id);

    // Souscription Assurance
    SouscriptionAssuranceResponse createSouscription(UUID utilisateurId, CreateSouscriptionAssuranceRequest request);
    SouscriptionAssuranceResponse getSouscriptionById(UUID id);
    List<SouscriptionAssuranceResponse> getSouscriptionsByUtilisateur(UUID utilisateurId);
    SouscriptionAssuranceResponse calculatePrix(UUID produitAssuranceId, List<UUID> optionIds);
    
    // Payment
    SouscriptionAssuranceResponse processPayment(UUID subscriptionId, UUID paiementId);
    
    // Contract Generation
    SouscriptionAssuranceResponse generateContract(UUID subscriptionId);
    
    // Document Upload
    SouscriptionAssuranceResponse uploadDocument(UUID subscriptionId, String documentType, String documentUrl);
}

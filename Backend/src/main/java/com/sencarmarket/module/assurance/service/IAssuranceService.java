package com.sencarmarket.module.assurance.service;

import com.sencarmarket.module.assurance.entity.OptionAssurance;
import com.sencarmarket.module.assurance.entity.ProduitAssurance;
import com.sencarmarket.module.assurance.entity.SouscriptionAssurance;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service assurance
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IAssuranceService {

    // Produit Assurance
    ProduitAssurance createProduitAssurance(ProduitAssurance produit);

    ProduitAssurance updateProduitAssurance(UUID id, ProduitAssurance produit);

    void deleteProduitAssurance(UUID id);

    ProduitAssurance getProduitAssuranceById(UUID id);

    List<ProduitAssurance> getAllProduitsAssurance();

    // Option Assurance
    OptionAssurance createOptionAssurance(OptionAssurance option);

    List<OptionAssurance> getOptionsByProduit(UUID produitId);

    // Souscription
    SouscriptionAssurance createSouscription(SouscriptionAssurance subscription);

    SouscriptionAssurance updateStatutSouscription(UUID id, String statut);

    SouscriptionAssurance getSouscriptionById(UUID id);

    List<SouscriptionAssurance> getSouscriptionsByUtilisateur(UUID utilisateurId);

    List<SouscriptionAssurance> getSouscriptionsActives();
}

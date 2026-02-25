package com.sencarmarket.module.assurance.service;

import com.sencarmarket.module.assurance.dto.OptionAssuranceResponse;
import com.sencarmarket.module.assurance.dto.ProduitAssuranceResponse;
import com.sencarmarket.module.assurance.dto.SouscriptionAssuranceResponse;
import com.sencarmarket.module.assurance.entity.OptionAssurance;
import com.sencarmarket.module.assurance.entity.ProduitAssurance;
import com.sencarmarket.module.assurance.entity.SouscriptionAssurance;
import com.sencarmarket.module.assurance.repository.OptionAssuranceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssuranceResponseMapper {

    private final OptionAssuranceRepository optionAssuranceRepository;

    public ProduitAssuranceResponse toProduitResponse(ProduitAssurance produit) {
        List<OptionAssuranceResponse> options = optionAssuranceRepository
                .findByProduitAssuranceId(produit.getId()).stream()
                .map(this::toOptionResponse)
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

    public OptionAssuranceResponse toOptionResponse(OptionAssurance option) {
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

    public SouscriptionAssuranceResponse toSouscriptionResponse(SouscriptionAssurance subscription) {
        List<OptionAssuranceResponse> options = subscription.getOptionsSelectionnees().stream()
                .map(this::toOptionResponse)
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

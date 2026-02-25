package com.sencarmarket.module.tradein.service;

import com.sencarmarket.module.tradein.dto.EstimationResponse;
import com.sencarmarket.module.tradein.entity.HistoriqueEstimation;
import com.sencarmarket.module.tradein.repository.HistoriqueEstimationRepository;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradeInEstimationService {

    private static final double COEFF_ETAT_EXCELLENT = 1.0;
    private static final double COEFF_ETAT_BON = 0.85;
    private static final double COEFF_ETAT_MOYEN = 0.70;
    private static final double COEFF_ETAT_MAUVAIS = 0.50;
    private static final double DEPRECIATION_PAR_KM = 0.0001;
    private static final double DEPRECIATION_PAR_AN = 0.10;

    private final HistoriqueEstimationRepository historiqueEstimationRepository;

    public EstimationResponse calculate(Vehicule vehicule, Integer kilometrage, String etatVehicule) {
        BigDecimal prixBase = vehicule.getPrixVente() == null ? BigDecimal.ZERO : vehicule.getPrixVente();
        int km = kilometrage == null ? 0 : kilometrage;
        int anneeVehicule = vehicule.getAnneeFabrication() == null
                ? LocalDateTime.now().getYear()
                : vehicule.getAnneeFabrication();

        double coeffEtat = getCoefficientEtat(etatVehicule);
        double depreciationKm = km * DEPRECIATION_PAR_KM;
        int ageVehicule = LocalDateTime.now().getYear() - anneeVehicule;
        double depreciationAge = Math.min(ageVehicule * DEPRECIATION_PAR_AN, 0.7);

        double coeffTotal = coeffEtat * (1 - depreciationKm) * (1 - depreciationAge);
        BigDecimal prixEstime = prixBase.multiply(BigDecimal.valueOf(coeffTotal))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal prixMinimum = prixEstime.multiply(BigDecimal.valueOf(0.85))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal prixMaximum = prixEstime.multiply(BigDecimal.valueOf(1.15))
                .setScale(2, RoundingMode.HALF_UP);

        double scoreCondition = coeffTotal * 100;
        String vehiculeDescription = buildVehiculeDescription(vehicule);

        return EstimationResponse.builder()
                .vehiculeId(vehicule.getId())
                .vehiculeDescription(vehiculeDescription)
                .prixEstime(prixEstime)
                .prixMinimum(prixMinimum)
                .prixMaximum(prixMaximum)
                .kilometrage(km)
                .etatVehicule(etatVehicule)
                .scoreCondition(scoreCondition)
                .recommandation(getRecommandation(scoreCondition))
                .build();
    }

    public void saveHistory(EstimationResponse estimation, Vehicule vehicule) {
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
        log.info("Estimation sauvegardee dans l'historique pour le vehicule {}", vehicule.getId());
    }

    private String buildVehiculeDescription(Vehicule vehicule) {
        String marqueNom = vehicule.getMarque() != null ? vehicule.getMarque().getNom() : "";
        String modeleNom = vehicule.getModele() != null ? vehicule.getModele().getNom() : "";
        String description = (marqueNom + " " + modeleNom).trim();
        return description.isEmpty() ? "Vehicule" : description;
    }

    private double getCoefficientEtat(String etat) {
        if (etat == null) {
            return COEFF_ETAT_MOYEN;
        }

        return switch (etat.toLowerCase(Locale.ROOT)) {
            case "excellent" -> COEFF_ETAT_EXCELLENT;
            case "bon" -> COEFF_ETAT_BON;
            case "moyen" -> COEFF_ETAT_MOYEN;
            case "mauvais" -> COEFF_ETAT_MAUVAIS;
            default -> COEFF_ETAT_MOYEN;
        };
    }

    private String getRecommandation(double scoreCondition) {
        if (scoreCondition >= 80) {
            return "Excellent etat - Vehicule hautement souhaitable";
        } else if (scoreCondition >= 60) {
            return "Bon etat - Vehicule interessante";
        } else if (scoreCondition >= 40) {
            return "Etat moyen - Negociation possible";
        } else {
            return "Etat preoccupant - Revision necessaire";
        }
    }
}

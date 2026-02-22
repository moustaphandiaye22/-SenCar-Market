package com.sencarmarket.module.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour les statistiques du dashboard admin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalUtilisateurs;
    private long totalAnnonces;
    private long totalAnnoncesActives;
    private long totalReservations;
    private long reservationsEnAttente;
    private double revenusTotaux;
    private double revenusCeMois;
    private long totalPaiements;
    private long paiementsEnAttente;
    private long totalAbonnements;
    private long abonnementsActifs;
}

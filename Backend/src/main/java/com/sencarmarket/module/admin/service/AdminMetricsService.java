package com.sencarmarket.module.admin.service;

import com.sencarmarket.module.abonnement.repository.UtilisateurAbonnementRepository;
import com.sencarmarket.module.admin.dto.DashboardStatsResponse;
import com.sencarmarket.module.annonce.repository.ReservationLocationRepository;
import com.sencarmarket.module.commun.enums.StatutReservation;
import com.sencarmarket.module.paiement.entity.TransactionPortefeuille;
import com.sencarmarket.module.paiement.enums.StatutTransaction;
import com.sencarmarket.module.paiement.repository.TransactionPortefeuilleRepository;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import com.sencarmarket.module.vehicule.entity.Statut;
import com.sencarmarket.module.vehicule.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminMetricsService {

    private final UtilisateurRepository utilisateurRepository;
    private final VehiculeRepository vehiculeRepository;
    private final TransactionPortefeuilleRepository transactionRepository;
    private final ReservationLocationRepository reservationRepository;
    private final UtilisateurAbonnementRepository utilisateurAbonnementRepository;

    public DashboardStatsResponse getDashboardStats() {
        long totalUtilisateurs = utilisateurRepository.count();
        long totalAnnonces = vehiculeRepository.count();
        long totalAnnoncesActives = vehiculeRepository.countByStatut(Statut.PUBLIE);
        long totalReservations = reservationRepository.count();
        long reservationsEnAttente = reservationRepository.countByStatut(StatutReservation.EN_ATTENTE);
        long totalPaiements = transactionRepository.count();
        long paiementsEnAttente = transactionRepository.countByStatut(StatutTransaction.EN_ATTENTE);
        long abonnementsActifs = utilisateurAbonnementRepository.countActiveSubscriptions();
        long totalAbonnements = utilisateurAbonnementRepository.count();

        double[] revenus = calculateRevenus();
        return DashboardStatsResponse.builder()
                .totalUtilisateurs(totalUtilisateurs)
                .totalAnnonces(totalAnnonces)
                .totalAnnoncesActives(totalAnnoncesActives)
                .totalReservations(totalReservations)
                .reservationsEnAttente(reservationsEnAttente)
                .revenusTotaux(revenus[0])
                .revenusCeMois(revenus[1])
                .totalPaiements(totalPaiements)
                .paiementsEnAttente(paiementsEnAttente)
                .totalAbonnements(totalAbonnements)
                .abonnementsActifs(abonnementsActifs)
                .build();
    }

    public double getTotalCommissions() {
        return transactionRepository.findByStatut(StatutTransaction.CONFIRMEE).stream()
                .mapToDouble(t -> {
                    double montant = t.getMontant() != null ? t.getMontant().doubleValue() : 0;
                    return montant * 0.05;
                })
                .sum();
    }

    private double[] calculateRevenus() {
        List<TransactionPortefeuille> transactionsConfirmees = transactionRepository.findByStatut(StatutTransaction.CONFIRMEE);
        double revenusTotaux = transactionsConfirmees.stream()
                .mapToDouble(t -> t.getMontant() != null ? t.getMontant().doubleValue() : 0)
                .sum();

        LocalDateTime debutMois = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        double revenusCeMois = transactionsConfirmees.stream()
                .filter(t -> t.getDateTransaction() != null && t.getDateTransaction().isAfter(debutMois))
                .mapToDouble(t -> t.getMontant() != null ? t.getMontant().doubleValue() : 0)
                .sum();

        return new double[]{revenusTotaux, revenusCeMois};
    }
}

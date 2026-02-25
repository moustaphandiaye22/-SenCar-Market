package com.sencarmarket.module.annonce.service;

import com.sencarmarket.module.annonce.entity.AnnonceLocation;
import com.sencarmarket.module.annonce.entity.ReservationLocation;
import com.sencarmarket.module.annonce.repository.ReservationLocationRepository;
import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.enums.StatutReservation;
import com.sencarmarket.module.commun.exception.InvalidStatusException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationRulesService {

    private final ReservationLocationRepository reservationLocationRepository;

    public boolean checkDisponibilite(UUID annonceId, LocalDateTime dateDebut, LocalDateTime dateFin) {
        List<ReservationLocation> reservations = reservationLocationRepository.findByAnnonceLocationId(annonceId);

        for (ReservationLocation reservation : reservations) {
            StatutReservation statut = reservation.getStatut();
            if (statut == StatutReservation.CONFIRME || statut == StatutReservation.EN_ATTENTE) {
                boolean isOverlapping = !(dateFin.isBefore(reservation.getDateDebut())
                        || dateDebut.isAfter(reservation.getDateFin()));
                if (isOverlapping) {
                    return false;
                }
            }
        }
        return true;
    }

    public BigDecimal calculateCoutTotal(AnnonceLocation annonce, LocalDateTime dateDebut, LocalDateTime dateFin) {
        long jours = Duration.between(dateDebut, dateFin).toDays();
        if (jours <= 0) {
            jours = 1;
        }
        return annonce.getTarifJournalier().multiply(BigDecimal.valueOf(jours));
    }

    public StatutReservation parseStatut(String statut) {
        if (statut == null || statut.isBlank()) {
            throw new InvalidStatusException(AppMessages.RESERVATION_STATUS_REQUIRED, getValidStatutNames());
        }
        try {
            return StatutReservation.valueOf(statut.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new InvalidStatusException(statut, getValidStatutNames());
        }
    }

    public String[] getValidStatutNames() {
        return java.util.Arrays.stream(StatutReservation.values())
                .map(StatutReservation::name)
                .toArray(String[]::new);
    }
}

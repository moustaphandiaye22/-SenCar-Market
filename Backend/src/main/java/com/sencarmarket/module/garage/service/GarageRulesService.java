package com.sencarmarket.module.garage.service;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.garage.entity.Garage;
import org.springframework.stereotype.Service;

@Service
public class GarageRulesService {

    public void validateStatutTransition(Garage.StatutValidation current, Garage.StatutValidation next) {
        if (current == Garage.StatutValidation.ACTIF && next != Garage.StatutValidation.SUSPENDU) {
            throw new InvalidOperationException(AppMessages.GARAGE_STATUS_ACTIVE_ONLY_SUSPEND);
        }
        if ((current == Garage.StatutValidation.REJET || current == Garage.StatutValidation.SUSPENDU)
                && next != Garage.StatutValidation.ACTIF) {
            throw new InvalidOperationException(AppMessages.GARAGE_STATUS_REJECTED_SUSPENDED_ONLY_REACTIVATE);
        }
    }

    public double[] calculateSearchBounds(double latitude, double longitude, double rayonKm) {
        double latDelta = rayonKm / 111.0;
        double lonDelta = rayonKm / (111.0 * Math.cos(Math.toRadians(latitude)));
        return new double[]{
                latitude - latDelta,
                latitude + latDelta,
                longitude - lonDelta,
                longitude + lonDelta
        };
    }
}

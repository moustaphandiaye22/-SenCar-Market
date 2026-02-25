package com.sencarmarket.module.avis.service;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.avis.entity.Avis;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import org.springframework.stereotype.Service;

@Service
public class AvisValidationService {

    public Avis.TypeAvis parseTypeAvis(String typeAvis) {
        try {
            return Avis.TypeAvis.valueOf(typeAvis);
        } catch (IllegalArgumentException e) {
            throw new InvalidOperationException(AppMessages.AVIS_TYPE_INVALID_PREFIX +
                    String.join(", ", java.util.Arrays.stream(Avis.TypeAvis.values()).map(Enum::name).toList()));
        }
    }

    public void validateSingleTarget(int cibleCount) {
        if (cibleCount == 0) {
            throw new InvalidOperationException(AppMessages.AVIS_TARGET_REQUIRED);
        }
        if (cibleCount > 1) {
            throw new InvalidOperationException(AppMessages.AVIS_SINGLE_TARGET_REQUIRED);
        }
    }

    public void validateNotSelfReview(boolean selfReview) {
        if (selfReview) {
            throw new InvalidOperationException(AppMessages.AVIS_CANNOT_RATE_SELF);
        }
    }
}

package com.sencarmarket.module.assurance.service;

import com.sencarmarket.module.assurance.entity.SouscriptionAssurance;
import com.sencarmarket.module.assurance.enums.StatutAssurance;
import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AssuranceLifecycleService {

    public void ensureCanProcessPayment(SouscriptionAssurance subscription) {
        if (subscription.getStatut() != StatutAssurance.EN_ATTENTE) {
            throw new InvalidOperationException(
                    AppMessages.ASSURANCE_PAYMENT_PROCESS_INVALID_PREFIX
                            + subscription.getStatut()
                            + AppMessages.ASSURANCE_PAYMENT_PROCESS_INVALID_SUFFIX);
        }
    }

    public void applyPayment(SouscriptionAssurance subscription, UUID paiementId) {
        subscription.setPaiementId(paiementId);
        subscription.setStatut(StatutAssurance.PAYEE);
    }

    public void ensureCanGenerateContract(SouscriptionAssurance subscription) {
        if (subscription.getStatut() != StatutAssurance.PAYEE) {
            throw new InvalidOperationException(AppMessages.ASSURANCE_CONTRACT_REQUIRES_PAYMENT);
        }
    }

    public void activateWithContract(SouscriptionAssurance subscription) {
        String contractUrl = "/contracts/" + subscription.getNumeroContrat() + ".pdf";
        subscription.setDocumentUrl(contractUrl);
        subscription.setStatut(StatutAssurance.ACTIVE);
    }
}

package com.sencarmarket.module.certification.service;

import com.sencarmarket.module.certification.entity.DemandeCertification;
import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import org.springframework.stereotype.Service;

@Service
public class CertificationStatusTransitionService {

    public void validateTransition(
            DemandeCertification.StatutDemande currentStatut,
            DemandeCertification.StatutDemande newStatut
    ) {
        switch (currentStatut) {
            case EN_ATTENTE:
                if (newStatut != DemandeCertification.StatutDemande.PAYEE
                        && newStatut != DemandeCertification.StatutDemande.REJETEE) {
                    throw new InvalidOperationException(
                            AppMessages.transitionMessage(
                                    AppMessages.CERTIFICATION_STATUS_TRANSITION_INVALID_PREFIX, currentStatut, newStatut));
                }
                break;
            case PAYEE:
                if (newStatut != DemandeCertification.StatutDemande.INSPECTION_PROGRAMMEE
                        && newStatut != DemandeCertification.StatutDemande.REJETEE) {
                    throw new InvalidOperationException(
                            AppMessages.transitionMessage(
                                    AppMessages.CERTIFICATION_STATUS_TRANSITION_INVALID_PREFIX, currentStatut, newStatut));
                }
                break;
            case INSPECTION_PROGRAMMEE:
                if (newStatut != DemandeCertification.StatutDemande.INSPECTE
                        && newStatut != DemandeCertification.StatutDemande.REJETEE) {
                    throw new InvalidOperationException(
                            AppMessages.transitionMessage(
                                    AppMessages.CERTIFICATION_STATUS_TRANSITION_INVALID_PREFIX, currentStatut, newStatut));
                }
                break;
            case INSPECTE:
                if (newStatut != DemandeCertification.StatutDemande.CERTIFIEE
                        && newStatut != DemandeCertification.StatutDemande.REJETEE) {
                    throw new InvalidOperationException(
                            AppMessages.transitionMessage(
                                    AppMessages.CERTIFICATION_STATUS_TRANSITION_INVALID_PREFIX, currentStatut, newStatut));
                }
                break;
            case CERTIFIEE:
            case REJETEE:
                throw new InvalidOperationException(AppMessages.CERTIFICATION_CANNOT_MODIFY_FINAL_STATE);
        }
    }
}

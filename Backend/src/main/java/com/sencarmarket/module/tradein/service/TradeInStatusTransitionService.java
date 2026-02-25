package com.sencarmarket.module.tradein.service;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.tradein.entity.DemandeTradeIn.StatutTradeIn;
import org.springframework.stereotype.Service;

@Service
public class TradeInStatusTransitionService {

    public void validateTransition(StatutTradeIn current, StatutTradeIn next) {
        switch (current) {
            case EN_ATTENTE:
                if (next != StatutTradeIn.EN_COURS_EVALUATION
                        && next != StatutTradeIn.REJETEE
                        && next != StatutTradeIn.ANNULEE) {
                    throw new InvalidOperationException(
                            AppMessages.transitionMessage(AppMessages.TRADEIN_STATUS_TRANSITION_INVALID_PREFIX, current, next));
                }
                break;
            case EN_COURS_EVALUATION:
                if (next != StatutTradeIn.EVALUATION_TERMINEE
                        && next != StatutTradeIn.REJETEE) {
                    throw new InvalidOperationException(
                            AppMessages.transitionMessage(AppMessages.TRADEIN_STATUS_TRANSITION_INVALID_PREFIX, current, next));
                }
                break;
            case EVALUATION_TERMINEE:
                if (next != StatutTradeIn.ACCEPTE
                        && next != StatutTradeIn.REJETEE) {
                    throw new InvalidOperationException(
                            AppMessages.transitionMessage(AppMessages.TRADEIN_STATUS_TRANSITION_INVALID_PREFIX, current, next));
                }
                break;
            case ACCEPTE:
            case REJETEE:
            case ANNULEE:
                throw new InvalidOperationException(
                        AppMessages.concat(AppMessages.TRADEIN_CANNOT_MODIFY_FINAL_PREFIX, current));
        }
    }
}

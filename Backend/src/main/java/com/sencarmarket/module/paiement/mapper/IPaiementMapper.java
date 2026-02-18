package com.sencarmarket.module.paiement.mapper;

import com.sencarmarket.module.paiement.dto.PaiementResponse;
import com.sencarmarket.module.paiement.dto.PortefeuilleResponse;
import com.sencarmarket.module.paiement.dto.TransactionResponse;
import com.sencarmarket.module.paiement.entity.Paiement;
import com.sencarmarket.module.paiement.entity.Portefeuille;
import com.sencarmarket.module.paiement.entity.TransactionPortefeuille;

/**
 * Interface pour le mapper paiement
 * Sépare la logique de mapping du service (pattern utilisé dans les autres modules)
 */
public interface IPaiementMapper {

    PaiementResponse toPaiementResponse(Paiement paiement);

    PortefeuilleResponse toPortefeuilleResponse(Portefeuille portefeuille);

    TransactionResponse toTransactionResponse(TransactionPortefeuille transaction);
}

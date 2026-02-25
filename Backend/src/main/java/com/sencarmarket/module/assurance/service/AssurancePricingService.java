package com.sencarmarket.module.assurance.service;

import com.sencarmarket.module.assurance.entity.OptionAssurance;
import com.sencarmarket.module.assurance.entity.ProduitAssurance;
import com.sencarmarket.module.assurance.repository.OptionAssuranceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssurancePricingService {

    private final OptionAssuranceRepository optionAssuranceRepository;

    public List<OptionAssurance> getSelectedOptions(List<UUID> optionIds) {
        if (optionIds == null || optionIds.isEmpty()) {
            return Collections.emptyList();
        }
        return optionAssuranceRepository.findAllById(optionIds);
    }

    public BigDecimal calculateTotalPrice(ProduitAssurance produit, List<OptionAssurance> options) {
        BigDecimal total = produit.getPrixBase();
        if (options == null || options.isEmpty()) {
            return total;
        }
        for (OptionAssurance option : options) {
            total = total.add(option.getPrixSupplementaire());
        }
        return total;
    }
}

package com.sencarmarket.module.paiement.service;

import com.sencarmarket.module.paiement.entity.PaiementLog;
import com.sencarmarket.module.paiement.repository.PaiementLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaiementLogService {

    private final PaiementLogRepository paiementLogRepository;

    public PaiementLog createLog(PaiementLog log) {
        if (log.getId() == null) {
            log.setId(UUID.randomUUID());
        }
        if (log.getDateAction() == null) {
            log.setDateAction(LocalDateTime.now());
        }
        return paiementLogRepository.save(log);
    }

    public void createLogAction(UUID paiementId, String action, String details) {
        PaiementLog log = PaiementLog.builder()
                .id(UUID.randomUUID())
                .paiementId(paiementId)
                .action(action)
                .details(details)
                .dateAction(LocalDateTime.now())
                .build();
        paiementLogRepository.save(log);
    }

    public List<PaiementLog> getLogsByPaiement(UUID paiementId) {
        return paiementLogRepository.findByPaiementIdOrderByDateActionDesc(paiementId);
    }
}

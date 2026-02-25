package com.sencarmarket.module.paiement.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sencarmarket.module.paiement.entity.Paiement;
import com.sencarmarket.module.paiement.enums.StatutPaiement;
import com.sencarmarket.module.paiement.repository.PaiementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaiementServiceTest {

    private PaiementRepository paiementRepository;
    private PaiementWebhookService webhookService;

    @BeforeEach
    void setUp() {
        paiementRepository = mock(PaiementRepository.class);
        PaiementLogService logService = mock(PaiementLogService.class);
        webhookService = new PaiementWebhookService(paiementRepository, new ObjectMapper(), logService);
    }

    @Test
    void verifyWebhookSignature_shouldFailWhenSecretMissing() {
        assertFalse(webhookService.verifyWebhookSignature("{}", "sig", ""));
    }

    @Test
    void processWaveWebhook_shouldConfirmPaymentWhenPayloadIsValid() throws Exception {
        String secret = "unit-test-secret";
        ReflectionTestUtils.setField(webhookService, "waveSecret", secret);

        Paiement paiement = Paiement.builder()
                .id(UUID.randomUUID())
                .referenceTransaction("tx123")
                .statut(StatutPaiement.EN_ATTENTE)
                .build();

        when(paiementRepository.findByReferenceTransaction("tx123")).thenReturn(List.of(paiement));
        when(paiementRepository.save(any(Paiement.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String payload = "{\"status\":\"SUCCESS\",\"reference_transaction\":\"tx123\"}";
        String signature = signHmacSha256(payload, secret);

        String result = webhookService.processWaveWebhook(payload, signature);

        assertEquals("SUCCESS", result);
        assertEquals(StatutPaiement.CONFIRME, paiement.getStatut());
        assertNotNull(paiement.getDatePaiement());
        assertTrue(paiement.getDatePaiement().isBefore(java.time.LocalDateTime.now().plusSeconds(1)));
        verify(paiementRepository, atLeastOnce()).save(any(Paiement.class));
    }

    private String signHmacSha256(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder builder = new StringBuilder();
        for (byte b : digest) {
            builder.append(String.format("%02x", b));
        }
        return builder.toString();
    }
}

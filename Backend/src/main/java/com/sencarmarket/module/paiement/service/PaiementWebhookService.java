package com.sencarmarket.module.paiement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sencarmarket.module.paiement.entity.Paiement;
import com.sencarmarket.module.paiement.enums.StatutPaiement;
import com.sencarmarket.module.paiement.repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaiementWebhookService {

    private static final String HMAC_SHA_256 = "HmacSHA256";

    private final PaiementRepository paiementRepository;
    private final ObjectMapper objectMapper;
    private final PaiementLogService paiementLogService;

    @Value("${paiements.wave.secret:}")
    private String waveSecret;

    @Value("${paiements.om.secret:}")
    private String omSecret;

    public String processWaveWebhook(String payload, String signature) {
        if (!verifyWebhookSignature(payload, signature, waveSecret)) {
            return "INVALID_SIGNATURE";
        }
        return processWebhookPayload(payload, "WAVE");
    }

    public String processOrangeMoneyWebhook(String payload, String signature) {
        if (!verifyWebhookSignature(payload, signature, omSecret)) {
            return "INVALID_SIGNATURE";
        }
        return processWebhookPayload(payload, "ORANGE_MONEY");
    }

    public boolean verifyWebhookSignature(String payload, String signature, String secret) {
        if (secret == null || secret.isBlank() || payload == null || signature == null || signature.isBlank()) {
            return false;
        }

        String normalizedSignature = normalizeSignature(signature);
        try {
            Mac mac = Mac.getInstance(HMAC_SHA_256);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA_256));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            String expectedHex = bytesToHex(digest);
            String expectedBase64 = Base64.getEncoder().encodeToString(digest);

            return MessageDigest.isEqual(normalizedSignature.getBytes(StandardCharsets.UTF_8),
                    expectedHex.getBytes(StandardCharsets.UTF_8))
                    || MessageDigest.isEqual(normalizedSignature.getBytes(StandardCharsets.UTF_8),
                    expectedBase64.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Erreur lors de la vérification de signature webhook", e);
            return false;
        }
    }

    private String processWebhookPayload(String payload, String provider) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            String status = readFirstNonBlank(root,
                    "status", "event", "payment_status", "transaction_status", "etat", "state");
            String externalRef = readFirstNonBlank(root,
                    "reference_externe", "external_reference", "externalRef", "reference", "transaction_id", "id");
            String transactionRef = readFirstNonBlank(root,
                    "reference_transaction", "merchant_reference", "reference", "transaction_ref", "tx_ref");

            if (externalRef == null && transactionRef == null) {
                return "IGNORED";
            }

            Paiement paiement = findPaiementByWebhookReference(externalRef, transactionRef);
            if (paiement == null) {
                return "NOT_FOUND";
            }

            StatutPaiement nouveauStatut = mapWebhookStatus(status);
            if (nouveauStatut == null) {
                paiementLogService.createLogAction(paiement.getId(), "WEBHOOK_IGNORED",
                        String.format("Provider=%s, statut non mappé='%s'", provider, status));
                return "IGNORED";
            }

            applyWebhookStatus(paiement, nouveauStatut, externalRef, provider, status);
            return "SUCCESS";
        } catch (Exception e) {
            log.error("Erreur de parsing webhook {}: {}", provider, e.getMessage(), e);
            return "INVALID_PAYLOAD";
        }
    }

    private Paiement findPaiementByWebhookReference(String externalRef, String transactionRef) {
        if (externalRef != null) {
            List<Paiement> byExternal = paiementRepository.findByReferenceExterne(externalRef);
            if (!byExternal.isEmpty()) {
                return byExternal.get(0);
            }
        }
        if (transactionRef != null) {
            List<Paiement> byTransaction = paiementRepository.findByReferenceTransaction(transactionRef);
            if (!byTransaction.isEmpty()) {
                return byTransaction.get(0);
            }
        }
        return null;
    }

    private void applyWebhookStatus(Paiement paiement, StatutPaiement nouveauStatut, String externalRef,
                                    String provider, String rawStatus) {
        StatutPaiement ancien = paiement.getStatut();
        if (ancien == nouveauStatut && paiement.getDatePaiement() != null) {
            paiementLogService.createLogAction(paiement.getId(), "WEBHOOK_DUPLICATE",
                    String.format("Provider=%s, statut=%s", provider, rawStatus));
            return;
        }
        paiement.setStatut(nouveauStatut);
        if (externalRef != null && (paiement.getReferenceExterne() == null || paiement.getReferenceExterne().isBlank())) {
            paiement.setReferenceExterne(externalRef);
        }
        if (nouveauStatut == StatutPaiement.CONFIRME && paiement.getDatePaiement() == null) {
            paiement.setDatePaiement(LocalDateTime.now());
        }
        paiementRepository.save(paiement);
        paiementLogService.createLogAction(paiement.getId(), "WEBHOOK_UPDATE",
                String.format("Provider=%s, statut brut=%s, %s -> %s", provider, rawStatus, ancien, nouveauStatut));
    }

    private StatutPaiement mapWebhookStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        String normalized = status.trim().toUpperCase(Locale.ROOT);
        if (normalized.contains("SUCCESS") || normalized.contains("SUCCES")
                || normalized.contains("PAID") || normalized.contains("CONFIRM")) {
            return StatutPaiement.CONFIRME;
        }
        if (normalized.contains("FAIL") || normalized.contains("ERROR")
                || normalized.contains("ECHOUE") || normalized.contains("FAILED")) {
            return StatutPaiement.ECHOUE;
        }
        if (normalized.contains("CANCEL") || normalized.contains("ANNULE")) {
            return StatutPaiement.ANNULE;
        }
        if (normalized.contains("REFUND") || normalized.contains("REMBOUR")) {
            return StatutPaiement.REMBOURSE;
        }
        if (normalized.contains("PENDING") || normalized.contains("WAIT")
                || normalized.contains("EN_ATTENTE")) {
            return StatutPaiement.EN_ATTENTE;
        }
        return null;
    }

    private String readFirstNonBlank(JsonNode root, String... fields) {
        for (String field : fields) {
            JsonNode node = root.path(field);
            if (!node.isMissingNode() && !node.isNull()) {
                String value = node.asText(null);
                if (value != null && !value.isBlank()) {
                    return value.trim();
                }
            }
        }
        JsonNode dataNode = root.path("data");
        if (!dataNode.isMissingNode() && dataNode.isObject()) {
            for (String field : fields) {
                JsonNode node = dataNode.path(field);
                if (!node.isMissingNode() && !node.isNull()) {
                    String value = node.asText(null);
                    if (value != null && !value.isBlank()) {
                        return value.trim();
                    }
                }
            }
        }
        return null;
    }

    private String normalizeSignature(String signature) {
        String normalized = signature.trim();
        if (normalized.regionMatches(true, 0, "sha256=", 0, 7)) {
            normalized = normalized.substring(7);
        }
        return normalized;
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            builder.append(String.format("%02x", b));
        }
        return builder.toString();
    }
}

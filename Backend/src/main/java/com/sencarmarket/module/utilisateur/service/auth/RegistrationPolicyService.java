package com.sencarmarket.module.utilisateur.service.auth;

import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.exception.InvalidOperationException;
import com.sencarmarket.module.utilisateur.entity.TypeUtilisateur;
import com.sencarmarket.module.utilisateur.repository.TypeUtilisateurRepository;
import com.sencarmarket.module.utilisateur.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrationPolicyService {

    private static final List<String> ALLOWED_USER_TYPES = List.of(
            "UTILISATEUR",
            "ACHETEUR",
            "VENDEUR",
            "CONCESSIONNAIRE",
            "LOCATAIRE",
            "PROPRIETAIRE_LOUEUR"
    );

    private static final List<String> RESTRICTED_USER_TYPES = List.of(
            "ADMIN",
            "MODERATEUR",
            "SUPER_ADMIN",
            "COMPAGNIE_ASSURANCE",
            "INSPECTEUR",
            "GARAGE",
            "PARTENAIRE_FINANCIER"
    );

    private final UtilisateurRepository utilisateurRepository;
    private final TypeUtilisateurRepository typeUtilisateurRepository;

    public void validateUniqueCredentials(String email, String telephone) {
        if (utilisateurRepository.existsByEmail(email)) {
            throw new InvalidOperationException(AppMessages.REGISTRATION_EMAIL_EXISTS);
        }

        if (utilisateurRepository.existsByTelephone(telephone)) {
            throw new InvalidOperationException(AppMessages.REGISTRATION_PHONE_EXISTS);
        }
    }

    public TypeUtilisateur resolveRegistrationType(String userType) {
        if (userType == null || userType.isBlank()) {
            throw new InvalidOperationException(AppMessages.REGISTRATION_USER_TYPE_REQUIRED);
        }

        String normalizedType = userType.toUpperCase();
        if (RESTRICTED_USER_TYPES.contains(normalizedType)) {
            throw new InvalidOperationException(AppMessages.REGISTRATION_RESTRICTED_TYPE);
        }

        if (!ALLOWED_USER_TYPES.contains(normalizedType)) {
            throw new InvalidOperationException(
                    AppMessages.concat(AppMessages.REGISTRATION_INVALID_TYPE_PREFIX,
                            String.join(", ", ALLOWED_USER_TYPES)));
        }

        return typeUtilisateurRepository.findByNom(normalizedType)
                .orElseThrow(() -> new InvalidOperationException(AppMessages.REGISTRATION_SYSTEM_INVALID_TYPE));
    }
}
